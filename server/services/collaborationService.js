const { logSocket, logError } = require('../utils/logger');

class CollaborationService {
  constructor(io) {
    this.io = io;
    this.activeUsers = new Map(); // userId -> userInfo
    this.userSockets = new Map(); // socketId -> userId
    this.documentSessions = new Map(); // documentId -> Set of userIds
    this.teamRooms = new Map(); // teamId -> Set of socketIds
    this.liveAnalyses = new Map(); // analysisId -> analysis data
    
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      logSocket('User connected to collaboration service', socket.id, {
        timestamp: new Date()
      });

      // User joins collaboration
      socket.on('join-collaboration', (userData) => {
        this.handleUserJoin(socket, userData);
      });

      // User joins document session
      socket.on('join-document', (documentData) => {
        this.handleDocumentJoin(socket, documentData);
      });

      // Live analysis sharing
      socket.on('share-analysis', (analysisData) => {
        this.handleAnalysisShare(socket, analysisData);
      });

      // Team chat
      socket.on('team-message', (messageData) => {
        this.handleTeamMessage(socket, messageData);
      });

      // Live cursor/presence
      socket.on('cursor-move', (cursorData) => {
        this.handleCursorMove(socket, cursorData);
      });

      // Analysis progress updates
      socket.on('analysis-progress', (progressData) => {
        this.handleAnalysisProgress(socket, progressData);
      });

      // Document comments
      socket.on('add-comment', (commentData) => {
        this.handleAddComment(socket, commentData);
      });

      // User disconnection
      socket.on('disconnect', () => {
        this.handleUserDisconnect(socket);
      });
    });
  }

  handleUserJoin(socket, userData) {
    const userId = userData.userId || `user_${socket.id}`;
    const userInfo = {
      id: userId,
      name: userData.name || 'Anonymous User',
      email: userData.email || 'anonymous@example.com',
      avatar: userData.avatar || this.generateAvatar(userData.name),
      role: userData.role || 'member',
      joinTime: new Date(),
      socketId: socket.id,
      status: 'online',
      currentDocument: null,
      lastActivity: new Date()
    };

    this.activeUsers.set(userId, userInfo);
    this.userSockets.set(socket.id, userId);

    // Join user to their team room
    const teamId = userData.teamId || 'default-team';
    socket.join(teamId);
    
    if (!this.teamRooms.has(teamId)) {
      this.teamRooms.set(teamId, new Set());
    }
    this.teamRooms.get(teamId).add(socket.id);

    // Broadcast user joined to team
    socket.to(teamId).emit('user-joined', {
      user: userInfo,
      timestamp: new Date(),
      totalUsers: this.activeUsers.size
    });

    // Send current active users to new user
    socket.emit('active-users', {
      users: Array.from(this.activeUsers.values()),
      totalCount: this.activeUsers.size
    });

    // Send current live analyses
    socket.emit('live-analyses', {
      analyses: Array.from(this.liveAnalyses.values())
    });

    logSocket('User joined collaboration', socket.id, {
      userId,
      name: userInfo.name,
      teamId,
      totalActiveUsers: this.activeUsers.size
    });
  }

  handleDocumentJoin(socket, documentData) {
    const userId = this.userSockets.get(socket.id);
    if (!userId) return;

    const documentId = documentData.documentId;
    const documentRoom = `doc_${documentId}`;

    // Join document room
    socket.join(documentRoom);

    // Track document session
    if (!this.documentSessions.has(documentId)) {
      this.documentSessions.set(documentId, new Set());
    }
    this.documentSessions.get(documentId).add(userId);

    // Update user's current document
    const userInfo = this.activeUsers.get(userId);
    if (userInfo) {
      userInfo.currentDocument = documentId;
      userInfo.lastActivity = new Date();
    }

    // Notify others in document
    socket.to(documentRoom).emit('user-joined-document', {
      userId,
      user: userInfo,
      documentId,
      activeViewers: this.documentSessions.get(documentId).size,
      timestamp: new Date()
    });

    // Send document viewers to new user
    const viewers = Array.from(this.documentSessions.get(documentId))
      .map(id => this.activeUsers.get(id))
      .filter(Boolean);

    socket.emit('document-viewers', {
      documentId,
      viewers,
      totalViewers: viewers.length
    });

    logSocket('User joined document session', socket.id, {
      userId,
      documentId,
      activeViewers: this.documentSessions.get(documentId).size
    });
  }

  handleAnalysisShare(socket, analysisData) {
    const userId = this.userSockets.get(socket.id);
    if (!userId) return;

    const analysisId = analysisData.analysisId;
    const liveAnalysis = {
      id: analysisId,
      userId,
      user: this.activeUsers.get(userId),
      title: analysisData.title || 'Sales Call Analysis',
      progress: analysisData.progress || 0,
      stage: analysisData.stage || 'Starting...',
      startTime: analysisData.startTime || new Date(),
      isLive: true,
      viewers: new Set([userId]),
      lastUpdate: new Date()
    };

    this.liveAnalyses.set(analysisId, liveAnalysis);

    // Broadcast to all active users
    this.io.emit('live-analysis-started', {
      analysis: liveAnalysis,
      timestamp: new Date()
    });

    logSocket('Live analysis shared', socket.id, {
      userId,
      analysisId,
      title: liveAnalysis.title
    });

    return liveAnalysis;
  }

  handleAnalysisProgress(socket, progressData) {
    const userId = this.userSockets.get(socket.id);
    if (!userId) return;

    const analysisId = progressData.analysisId;
    const liveAnalysis = this.liveAnalyses.get(analysisId);

    if (liveAnalysis && liveAnalysis.userId === userId) {
      // Update progress
      liveAnalysis.progress = progressData.progress;
      liveAnalysis.stage = progressData.stage;
      liveAnalysis.lastUpdate = new Date();

      if (progressData.completed) {
        liveAnalysis.isLive = false;
        liveAnalysis.completedAt = new Date();
        liveAnalysis.results = progressData.results;
      }

      // Broadcast progress to all users
      this.io.emit('analysis-progress-update', {
        analysisId,
        progress: liveAnalysis.progress,
        stage: liveAnalysis.stage,
        completed: progressData.completed,
        results: progressData.results,
        timestamp: new Date()
      });

      logSocket('Analysis progress updated', socket.id, {
        analysisId,
        progress: liveAnalysis.progress,
        stage: liveAnalysis.stage,
        completed: progressData.completed
      });
    }
  }

  handleTeamMessage(socket, messageData) {
    const userId = this.userSockets.get(socket.id);
    if (!userId) return;

    const userInfo = this.activeUsers.get(userId);
    const teamId = messageData.teamId || 'default-team';

    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      user: userInfo,
      content: messageData.content,
      type: messageData.type || 'text', // text, system, analysis-share
      timestamp: new Date(),
      reactions: {},
      metadata: messageData.metadata || {}
    };

    // Broadcast to team room
    this.io.to(teamId).emit('team-message', message);

    logSocket('Team message sent', socket.id, {
      userId,
      teamId,
      messageType: message.type,
      contentLength: message.content?.length || 0
    });

    return message;
  }

  handleCursorMove(socket, cursorData) {
    const userId = this.userSockets.get(socket.id);
    if (!userId) return;

    const documentRoom = `doc_${cursorData.documentId}`;
    
    // Broadcast cursor position to others in document
    socket.to(documentRoom).emit('cursor-update', {
      userId,
      user: this.activeUsers.get(userId),
      position: cursorData.position,
      selection: cursorData.selection,
      timestamp: new Date()
    });
  }

  handleAddComment(socket, commentData) {
    const userId = this.userSockets.get(socket.id);
    if (!userId) return;

    const userInfo = this.activeUsers.get(userId);
    const documentRoom = `doc_${commentData.documentId}`;

    const comment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      user: userInfo,
      content: commentData.content,
      position: commentData.position,
      thread: commentData.thread || null,
      timestamp: new Date(),
      replies: [],
      resolved: false
    };

    // Broadcast comment to document viewers
    this.io.to(documentRoom).emit('comment-added', {
      comment,
      documentId: commentData.documentId
    });

    logSocket('Comment added', socket.id, {
      userId,
      documentId: commentData.documentId,
      commentId: comment.id
    });

    return comment;
  }

  handleUserDisconnect(socket) {
    const userId = this.userSockets.get(socket.id);
    if (!userId) return;

    const userInfo = this.activeUsers.get(userId);
    
    // Remove from active users
    this.activeUsers.delete(userId);
    this.userSockets.delete(socket.id);

    // Remove from document sessions
    for (const [docId, userSet] of this.documentSessions.entries()) {
      if (userSet.has(userId)) {
        userSet.delete(userId);
        
        // Notify document viewers
        this.io.to(`doc_${docId}`).emit('user-left-document', {
          userId,
          user: userInfo,
          documentId: docId,
          activeViewers: userSet.size,
          timestamp: new Date()
        });

        // Clean up empty sessions
        if (userSet.size === 0) {
          this.documentSessions.delete(docId);
        }
      }
    }

    // Remove from team rooms
    for (const [teamId, socketSet] of this.teamRooms.entries()) {
      if (socketSet.has(socket.id)) {
        socketSet.delete(socket.id);
        
        // Notify team
        this.io.to(teamId).emit('user-left', {
          userId,
          user: userInfo,
          timestamp: new Date(),
          totalUsers: this.activeUsers.size
        });

        // Clean up empty teams
        if (socketSet.size === 0) {
          this.teamRooms.delete(teamId);
        }
      }
    }

    // Clean up live analyses
    for (const [analysisId, analysis] of this.liveAnalyses.entries()) {
      if (analysis.userId === userId) {
        analysis.isLive = false;
        analysis.disconnectedAt = new Date();
        
        this.io.emit('analysis-disconnected', {
          analysisId,
          userId,
          timestamp: new Date()
        });
      }
    }

    logSocket('User disconnected from collaboration', socket.id, {
      userId,
      name: userInfo?.name,
      totalActiveUsers: this.activeUsers.size
    });
  }

  // Utility methods
  generateAvatar(name) {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const initial = (name || 'A').charAt(0).toUpperCase();
    const color = colors[name?.charCodeAt(0) % colors.length] || colors[0];
    
    return {
      initial,
      backgroundColor: color,
      textColor: '#FFFFFF'
    };
  }

  getActiveUsers() {
    return Array.from(this.activeUsers.values());
  }

  getLiveAnalyses() {
    return Array.from(this.liveAnalyses.values()).filter(a => a.isLive);
  }

  getDocumentViewers(documentId) {
    const viewers = this.documentSessions.get(documentId);
    if (!viewers) return [];
    
    return Array.from(viewers)
      .map(userId => this.activeUsers.get(userId))
      .filter(Boolean);
  }

  // Send system notifications
  sendSystemNotification(message, type = 'info', targetUsers = null) {
    const notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type, // info, success, warning, error
      message,
      timestamp: new Date(),
      system: true
    };

    if (targetUsers) {
      // Send to specific users
      targetUsers.forEach(userId => {
        const userInfo = this.activeUsers.get(userId);
        if (userInfo) {
          this.io.to(userInfo.socketId).emit('system-notification', notification);
        }
      });
    } else {
      // Send to all users
      this.io.emit('system-notification', notification);
    }

    return notification;
  }
}

module.exports = CollaborationService; 