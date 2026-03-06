const { Server } = require('socket.io');

/**
 * Socket.IO Implementation for Real-Time Workflow Collaboration
 * Handles node updates, edge updates, and workflow synchronization
 */
module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*', // Adjust to specific frontend URL in production
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`[WorkflowCollaboration] 🟢 Client connected: ${socket.id}`);

    // Join a specific workflow room to isolate events
    socket.on('join-workflow', (workflowId) => {
      socket.join(workflowId);
      console.log(`[WorkflowCollaboration] 🚪 Client ${socket.id} joined workflow room: ${workflowId}`);
    });

    // Handle node updates
    socket.on('node-update', (data) => {
      const { workflowId, nodeData } = data;
      console.log(`[WorkflowCollaboration] 🔄 Node updated in workflow ${workflowId}:`, nodeData);
      
      // Broadcast to everyone in the room EXCEPT the sender
      socket.to(workflowId).emit('node-updated', nodeData);
    });

    // Handle edge updates
    socket.on('edge-update', (data) => {
      const { workflowId, edgeData } = data;
      console.log(`[WorkflowCollaboration] 🔗 Edge updated in workflow ${workflowId}:`, edgeData);
      
      // Broadcast to everyone in the room EXCEPT the sender
      socket.to(workflowId).emit('edge-updated', edgeData);
    });

    // Workflow sync
    socket.on('workflow-sync', (data) => {
      const { workflowId, state } = data;
      console.log(`[WorkflowCollaboration] 🔁 Syncing workflow state for ${workflowId}`);
      
      // Broadcast to everyone in the room EXCEPT the sender
      socket.to(workflowId).emit('workflow-synced', state);
    });

    socket.on('leave-workflow', (workflowId) => {
      socket.leave(workflowId);
      console.log(`[WorkflowCollaboration] 👋 Client ${socket.id} left workflow room: ${workflowId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[WorkflowCollaboration] 🔴 Client disconnected: ${socket.id}`);
    });
  });

  return io;
};