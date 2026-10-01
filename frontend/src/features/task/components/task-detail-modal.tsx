'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  useTask,
  useUpdateTask,
  useDeleteTask,
  useAssignUser,
  useRemoveUser,
  useLabels,
  useCreateLabel,
  useAssignLabel,
  useRemoveLabel,
  useComments,
  useCreateComment,
  useDeleteComment,
  useAttachments,
  useUploadAttachment,
  useDeleteAttachment,
} from '../hooks/use-tasks';
import { useProjectMembers } from '@/features/project/hooks/use-projects';
import { TaskStatus, TaskPriority } from '@/types/task';
import { useAuth } from '@/providers/auth-provider';
import {
  Trash2,
  Calendar,
  Clock,
  UserPlus,
  Tag,
  Paperclip,
  MessageSquare,
  Send,
  Download,
  X,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskDetailModalProps {
  taskId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId?: number;
  projectId?: number;
}

export function TaskDetailModal({
  taskId,
  open,
  onOpenChange,
  boardId,
  projectId,
}: TaskDetailModalProps) {
  const { user: currentUser } = useAuth();
  const { data: task, isLoading } = useTask(taskId || 0, open && Boolean(taskId));

  const [activeTab, setActiveTab] = useState<'comments' | 'attachments'>('comments');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [newComment, setNewComment] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddAssignee, setShowAddAssignee] = useState(false);
  const [showAddLabel, setShowAddLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#5B5CEB');

  // Mutations
  const updateTaskMutation = useUpdateTask(boardId);
  const deleteTaskMutation = useDeleteTask(boardId);
  const assignUserMutation = useAssignUser(taskId || 0, boardId);
  const removeUserMutation = useRemoveUser(taskId || 0, boardId);
  const assignLabelMutation = useAssignLabel(taskId || 0, boardId);
  const removeLabelMutation = useRemoveLabel(taskId || 0, boardId);
  const createLabelMutation = useCreateLabel(projectId || task?.projectId);
  const createCommentMutation = useCreateComment(taskId || 0);
  const deleteCommentMutation = useDeleteComment(taskId || 0);
  const uploadAttachmentMutation = useUploadAttachment(taskId || 0);
  const deleteAttachmentMutation = useDeleteAttachment(taskId || 0);

  // Queries
  const effectiveProjectId = projectId || task?.projectId;
  const { data: projectMembersData } = useProjectMembers(effectiveProjectId || 0);
  const { data: labelsData } = useLabels(effectiveProjectId);
  const { data: commentsData } = useComments(taskId || 0);
  const { data: attachmentsData } = useAttachments(taskId || 0);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
    }
  }, [task]);

  if (!open) return null;

  const handleSaveTitle = () => {
    if (taskId && title.trim() && title !== task?.title) {
      updateTaskMutation.mutate({ id: taskId, data: { title: title.trim() } });
    }
    setIsEditingTitle(false);
  };

  const handleSaveDescription = () => {
    if (taskId && description !== (task?.description || '')) {
      updateTaskMutation.mutate({
        id: taskId,
        data: { description: description.trim() || undefined },
      });
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !taskId) return;
    createCommentMutation.mutate(newComment.trim(), {
      onSuccess: () => setNewComment(''),
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && taskId) {
      uploadAttachmentMutation.mutate(file);
    }
  };

  const handleCreateAndAssignLabel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabelName.trim() || !effectiveProjectId) return;
    createLabelMutation.mutate(
      {
        projectId: effectiveProjectId,
        name: newLabelName.trim(),
        color: newLabelColor,
      },
      {
        onSuccess: (newLabel) => {
          if (taskId) {
            assignLabelMutation.mutate(newLabel.id);
          }
          setNewLabelName('');
          setShowAddLabel(false);
        },
      }
    );
  };

  const projectMembers = projectMembersData?.items || [];
  const assignedUserIds = task?.assignees?.map((a) => a.userId) || [];
  const unassignedMembers = projectMembers.filter(
    (m) => !assignedUserIds.includes(m.userId)
  );

  const availableLabels = labelsData?.items || [];
  const taskLabelIds = task?.labels?.map((l) => l.labelId) || [];
  const unassignedLabels = availableLabels.filter(
    (l) => !taskLabelIds.includes(l.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-4xl p-0 overflow-hidden">
      {isLoading || !task ? (
        <div className="p-16 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="p-6 border-b border-border/80 flex items-start justify-between gap-4 bg-background">
            <div className="flex-1 min-w-0">
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleSaveTitle}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveTitle();
                      if (e.key === 'Escape') setIsEditingTitle(false);
                    }}
                    autoFocus
                    className="text-lg font-bold"
                  />
                  <Button size="sm" onClick={handleSaveTitle}>
                    Save
                  </Button>
                </div>
              ) : (
                <h2
                  onClick={() => setIsEditingTitle(true)}
                  className="text-xl font-bold text-foreground cursor-pointer hover:text-primary transition-colors flex items-center gap-2"
                  title="Click to edit title"
                >
                  {task.title}
                </h2>
              )}

              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <span>In column: <strong className="text-foreground">{task.column?.name || 'Board'}</strong></span>
                <span>•</span>
                <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Modal Body: Left (Content) + Right (Metadata Sidebar) */}
          <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/80">
            {/* Left Main (2 columns) */}
            <div className="p-6 md:col-span-2 space-y-6">
              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={handleSaveDescription}
                  placeholder="Add a detailed description for this task..."
                  rows={4}
                  className="w-full p-3 rounded-[14px] border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
              </div>

              {/* Tabs: Comments & Attachments */}
              <div className="border-t border-border/80 pt-6">
                <div className="flex items-center gap-4 border-b border-border/80 pb-3">
                  <button
                    onClick={() => setActiveTab('comments')}
                    className={cn(
                      'flex items-center gap-2 text-sm font-semibold pb-1 border-b-2 transition-all',
                      activeTab === 'comments'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Comments ({commentsData?.meta?.total ?? commentsData?.items?.length ?? task._count?.comments ?? 0})
                  </button>
                  <button
                    onClick={() => setActiveTab('attachments')}
                    className={cn(
                      'flex items-center gap-2 text-sm font-semibold pb-1 border-b-2 transition-all',
                      activeTab === 'attachments'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Paperclip className="w-4 h-4" />
                    Attachments ({attachmentsData?.meta?.total ?? attachmentsData?.items?.length ?? task._count?.attachments ?? 0})
                  </button>
                </div>

                {/* Tab: Comments */}
                {activeTab === 'comments' && (
                  <div className="mt-4 space-y-4">
                    {/* Add Comment Input */}
                    <form onSubmit={handleAddComment} className="flex gap-2">
                      <Input
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="flex-1"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        disabled={!newComment.trim()}
                        isLoading={createCommentMutation.isPending}
                      >
                        <Send className="w-3.5 h-3.5 mr-1.5" /> Post
                      </Button>
                    </form>

                    {/* Comments List */}
                    <div className="space-y-3 mt-4">
                      {commentsData?.items?.map((c) => (
                        <div
                          key={c.id}
                          className="p-3.5 rounded-xl bg-secondary/40 border border-border/60 text-sm"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center uppercase">
                                {c.user?.name?.[0] || 'U'}
                              </div>
                              <span className="font-semibold text-xs text-foreground">
                                {c.user?.name || c.user?.email}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(c.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>

                            {currentUser?.id === c.userId && (
                              <button
                                onClick={() => deleteCommentMutation.mutate(c.id)}
                                className="text-muted-foreground hover:text-destructive transition-colors p-1"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
                            {c.content}
                          </p>
                        </div>
                      ))}

                      {(!commentsData?.items || commentsData.items.length === 0) && (
                        <p className="text-center py-6 text-xs text-muted-foreground">
                          No comments yet. Start the conversation!
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab: Attachments */}
                {activeTab === 'attachments' && (
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileUpload}
                          disabled={uploadAttachmentMutation.isPending}
                        />
                        <span className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs">
                          <Plus className="w-3.5 h-3.5" />
                          {uploadAttachmentMutation.isPending ? 'Uploading...' : 'Upload File'}
                        </span>
                      </label>
                    </div>

                    <div className="space-y-2 mt-3">
                      {attachmentsData?.items?.map((att) => (
                        <div
                          key={att.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 border border-border/60 text-xs"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <Paperclip className="w-4 h-4 text-primary shrink-0" />
                            <div className="truncate">
                              <p className="font-medium text-foreground truncate">
                                {att.fileName}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {(att.fileSize / 1024).toFixed(1)} KB • {new Date(att.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <a
                              href={att.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() => deleteAttachmentMutation.mutate(att.id)}
                              className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {(!attachmentsData?.items || attachmentsData.items.length === 0) && (
                        <p className="text-center py-6 text-xs text-muted-foreground">
                          No attachments uploaded yet.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar: Attributes (1 column) */}
            <div className="p-6 space-y-6 bg-secondary/20">
              {/* Status */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Status
                </label>
                <select
                  value={task.status}
                  onChange={(e) =>
                    updateTaskMutation.mutate({
                      id: task.id,
                      data: { status: e.target.value as TaskStatus },
                    })
                  }
                  className="w-full h-10 px-3 rounded-[12px] border border-input bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="IN_REVIEW">In Review</option>
                  <option value="DONE">Done</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Priority
                </label>
                <select
                  value={task.priority}
                  onChange={(e) =>
                    updateTaskMutation.mutate({
                      id: task.id,
                      data: { priority: e.target.value as TaskPriority },
                    })
                  }
                  className="w-full h-10 px-3 rounded-[12px] border border-input bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              {/* Due Date */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Due Date
                </label>
                <Input
                  type="date"
                  value={task.dueDate ? task.dueDate.split('T')[0] : ''}
                  onChange={(e) =>
                    updateTaskMutation.mutate({
                      id: task.id,
                      data: { dueDate: e.target.value ? new Date(e.target.value).toISOString() : null },
                    })
                  }
                  className="h-10 text-xs"
                />
              </div>

              {/* Assignees */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Assignees
                  </label>
                  <button
                    onClick={() => setShowAddAssignee(!showAddAssignee)}
                    className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
                  >
                    <UserPlus className="w-3 h-3" /> Assign
                  </button>
                </div>

                <div className="space-y-1.5">
                  {task.assignees?.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-background border border-border text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center uppercase">
                          {a.user?.name?.[0] || 'U'}
                        </div>
                        <span className="font-medium text-foreground truncate">
                          {a.user?.name || a.user?.email}
                        </span>
                      </div>
                      <button
                        onClick={() => removeUserMutation.mutate(a.userId)}
                        className="text-muted-foreground hover:text-destructive p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {(!task.assignees || task.assignees.length === 0) && (
                    <p className="text-xs text-muted-foreground">Unassigned</p>
                  )}
                </div>

                {/* Add Assignee Dropdown */}
                {showAddAssignee && (
                  <div className="mt-2 p-2 rounded-xl bg-background border border-border shadow-md">
                    <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">
                      Assign Member
                    </p>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {unassignedMembers.map((m) => (
                        <button
                          key={m.userId}
                          onClick={() => {
                            assignUserMutation.mutate(m.userId);
                            setShowAddAssignee(false);
                          }}
                          className="w-full flex items-center gap-2 p-1.5 text-xs rounded-lg hover:bg-secondary text-left font-medium"
                        >
                          <div className="w-4 h-4 rounded-full bg-primary/10 text-primary text-[9px] font-bold flex items-center justify-center uppercase">
                            {m.user?.name?.[0] || 'U'}
                          </div>
                          <span className="truncate">{m.user?.name || m.user?.email}</span>
                        </button>
                      ))}
                      {unassignedMembers.length === 0 && (
                        <p className="text-[11px] text-muted-foreground text-center py-1">
                          No more members to assign
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Labels */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Labels
                  </label>
                  <button
                    onClick={() => setShowAddLabel(!showAddLabel)}
                    className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
                  >
                    <Tag className="w-3 h-3" /> Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {task.labels?.map((tl) => (
                    <span
                      key={tl.id}
                      className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border"
                      style={{
                        backgroundColor: `${tl.label.color}15`,
                        borderColor: `${tl.label.color}40`,
                        color: tl.label.color,
                      }}
                    >
                      {tl.label.name}
                      <button
                        onClick={() => removeLabelMutation.mutate(tl.labelId)}
                        className="hover:opacity-75"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}

                  {(!task.labels || task.labels.length === 0) && (
                    <p className="text-xs text-muted-foreground">No labels</p>
                  )}
                </div>

                {/* Add / Create Label Popover */}
                {showAddLabel && (
                  <div className="mt-2 p-3 rounded-xl bg-background border border-border shadow-md space-y-3">
                    <p className="text-[11px] font-semibold text-muted-foreground">
                      Select or Create Label
                    </p>

                    {/* Available Existing Labels */}
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                      {unassignedLabels.map((lbl) => (
                        <button
                          key={lbl.id}
                          onClick={() => {
                            assignLabelMutation.mutate(lbl.id);
                            setShowAddLabel(false);
                          }}
                          className="text-[11px] font-medium px-2 py-0.5 rounded-full border hover:opacity-80 transition-opacity"
                          style={{
                            backgroundColor: `${lbl.color}15`,
                            borderColor: `${lbl.color}40`,
                            color: lbl.color,
                          }}
                        >
                          {lbl.name}
                        </button>
                      ))}
                    </div>

                    {/* Create New Label Form */}
                    <form onSubmit={handleCreateAndAssignLabel} className="space-y-2 pt-2 border-t border-border">
                      <div className="flex gap-2">
                        <Input
                          value={newLabelName}
                          onChange={(e) => setNewLabelName(e.target.value)}
                          placeholder="New label name"
                          className="h-8 text-xs"
                        />
                        <input
                          type="color"
                          value={newLabelColor}
                          onChange={(e) => setNewLabelColor(e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-input p-0.5"
                        />
                      </div>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={!newLabelName.trim()}
                        isLoading={createLabelMutation.isPending}
                        className="w-full h-7 text-xs"
                      >
                        Create & Assign
                      </Button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Task Confirmation */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete Task"
        variant="destructive"
        onConfirm={() => {
          if (taskId) {
            deleteTaskMutation.mutate(taskId, {
              onSuccess: () => onOpenChange(false),
            });
          }
        }}
      />
    </Dialog>
  );
}

