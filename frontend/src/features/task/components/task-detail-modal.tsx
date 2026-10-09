'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  useDeleteAttachment,
} from '../hooks/use-tasks';
import { useProjectMembers } from '@/features/project/hooks/use-projects';
import { TaskStatus, TaskPriority, TaskAttachment } from '@/types/task';
import { taskService } from '@/services/task.service';
import { useAuth } from '@/providers/auth-provider';
import { AttachmentPreviewModal } from './attachment-preview-modal';
import { AttachmentUploadZone } from './attachment-upload-zone';
import { UserAvatar } from '@/components/ui/user-avatar';
import { getAssetUrl } from '@/lib/assets';
import { toast } from 'sonner';
import {
  Trash2,
  UserPlus,
  Tag,
  Paperclip,
  MessageSquare,
  Send,
  Download,
  X,
  Eye,
  Copy,
  Check,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  FileCode,
  FileSpreadsheet,
  File,
  Calendar,
  Clock,
  CheckSquare,
  ExternalLink,
  Plus,
  Activity,
  Flame,
  ArrowUp,
  Minus,
  ArrowDown,
  CornerDownLeft,
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

  const [activeTab, setActiveTab] = useState<'comments' | 'attachments' | 'checklist' | 'activity'>('comments');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newChecklistText, setNewChecklistText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddAssignee, setShowAddAssignee] = useState(false);
  const [showAddLabel, setShowAddLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#5B5CEB');

  const [previewAttachment, setPreviewAttachment] = useState<TaskAttachment | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState<number | null>(null);
  const [copiedAttachmentId, setCopiedAttachmentId] = useState<number | null>(null);
  const [isCopiedLink, setIsCopiedLink] = useState(false);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  const getAttachmentCategory = (fileName: string, mimeType?: string) => {
    const ext = fileName.toLowerCase().split('.').pop() || '';
    const mime = mimeType?.toLowerCase() || '';
    if (ext === 'pdf' || mime === 'application/pdf') return 'pdf';
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext) || mime.startsWith('image/')) return 'image';
    if (['mp4', 'webm', 'mov', 'mkv'].includes(ext) || mime.startsWith('video/')) return 'video';
    if (['mp3', 'wav', 'ogg'].includes(ext) || mime.startsWith('audio/')) return 'audio';
    if (['txt', 'json', 'csv', 'xml', 'log', 'md', 'ts', 'js'].includes(ext) || mime.startsWith('text/')) return 'text';
    if (['docx', 'xlsx', 'pptx', 'doc', 'xls'].includes(ext) || mime.includes('spreadsheet') || mime.includes('wordprocessing')) return 'office';
    return 'other';
  };

  const renderAttachmentIcon = (category: string) => {
    switch (category) {
      case 'pdf': return <FileText className="w-4 h-4 text-rose-500" />;
      case 'image': return <ImageIcon className="w-4 h-4 text-sky-500" />;
      case 'video': return <Video className="w-4 h-4 text-purple-500" />;
      case 'audio': return <Music className="w-4 h-4 text-emerald-500" />;
      case 'text': return <FileCode className="w-4 h-4 text-amber-500" />;
      case 'office': return <FileSpreadsheet className="w-4 h-4 text-teal-500" />;
      default: return <File className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const handleDownloadAttachment = async (att: TaskAttachment) => {
    try {
      await taskService.downloadAttachment(att.id, att.fileName);
      toast.success(`Downloaded ${att.fileName}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Download failed');
    }
  };

  const handleCopyAttachmentLink = (att: TaskAttachment) => {
    const url = taskService.getAttachmentViewUrl(att.id);
    navigator.clipboard.writeText(url);
    setCopiedAttachmentId(att.id);
    toast.success('Direct link copied to clipboard');
    setTimeout(() => setCopiedAttachmentId(null), 2000);
  };

  const handleCopyTaskLink = () => {
    if (typeof window !== 'undefined' && taskId) {
      const url = `${window.location.origin}/tasks/${taskId}`;
      navigator.clipboard.writeText(url);
      setIsCopiedLink(true);
      toast.success('Task link copied to clipboard');
      setTimeout(() => setIsCopiedLink(false), 2000);
    }
  };

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
  const deleteAttachmentMutation = useDeleteAttachment(taskId || 0);

  // Queries
  const effectiveProjectId = projectId || task?.projectId;
  const { data: projectMembersData } = useProjectMembers(effectiveProjectId || 0);
  const { data: labelsData } = useLabels(effectiveProjectId);
  const { data: commentsData } = useComments(taskId || 0);
  const { data: attachmentsData } = useAttachments(taskId || 0);

  const [prevTask, setPrevTask] = useState(task);
  if (task !== prevTask) {
    setPrevTask(task);
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
    }
  }

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

  // Checklist helper logic
  const parseChecklistItems = () => {
    if (!description) return [];
    const lines = description.split('\n');
    const items: { lineIndex: number; text: string; completed: boolean }[] = [];
    lines.forEach((line, index) => {
      const match = line.match(/^-\s*\[([ xX])\]\s*(.*)$/);
      if (match) {
        items.push({
          lineIndex: index,
          completed: match[1].toLowerCase() === 'x',
          text: match[2],
        });
      }
    });
    return items;
  };

  const checklistItems = parseChecklistItems();
  const completedChecklistCount = checklistItems.filter((i) => i.completed).length;
  const checklistPercentage =
    checklistItems.length > 0
      ? Math.round((completedChecklistCount / checklistItems.length) * 100)
      : 0;

  const handleToggleChecklistItem = (lineIndex: number, currentCompleted: boolean) => {
    if (!taskId) return;
    const lines = description.split('\n');
    const currentLine = lines[lineIndex];
    if (currentLine) {
      const newBox = currentCompleted ? '- [ ]' : '- [x]';
      lines[lineIndex] = currentLine.replace(/^-\s*\[([ xX])\]/, newBox);
      const newDesc = lines.join('\n');
      setDescription(newDesc);
      updateTaskMutation.mutate({
        id: taskId,
        data: { description: newDesc },
      });
    }
  };

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim() || !taskId) return;
    const newItem = `- [ ] ${newChecklistText.trim()}`;
    const newDesc = description ? `${description}\n${newItem}` : newItem;
    setDescription(newDesc);
    setNewChecklistText('');
    updateTaskMutation.mutate({
      id: taskId,
      data: { description: newDesc },
    });
  };

  const projectMembers = projectMembersData?.items || [];
  const assignedUserIds = task?.assignees?.map((a) => a.userId) || [];
  const unassignedMembers = projectMembers.filter(
    (m) => !assignedUserIds.includes(m.userId)
  );

  const availableLabels = labelsData?.items || [];
  const assignedLabelIds = task?.labels?.map((l) => l.labelId) || [];
  const unassignedLabels = availableLabels.filter(
    (l) => !assignedLabelIds.includes(l.id)
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
        onClick={() => onOpenChange(false)}
      />

      {/* Right Sliding Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-2xl lg:max-w-3xl bg-background border-l border-border shadow-2xl flex flex-col h-full transform transition-transform ease-out duration-300 animate-in slide-in-from-right">
          {/* Drawer Top Navigation Bar */}
          <div className="px-6 py-4 border-b border-border/80 flex items-center justify-between shrink-0 bg-card/60 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold uppercase px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground border border-border/60">
                TASK-{task?.id || taskId}
              </span>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                in {task?.column?.name || 'Board'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyTaskLink}
                className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5"
                title="Copy direct task link"
              >
                {isCopiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isCopiedLink ? 'Copied' : 'Copy Link'}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </Button>

              <div className="h-4 w-px bg-border mx-1" />

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                title="Close drawer (Esc)"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Drawer Body - Scrollable */}
          {isLoading || !task ? (
            <div className="flex-1 flex items-center justify-center">
              <Spinner className="w-7 h-7 text-primary" />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto divide-y divide-border/60 scrollbar-thin">
              {/* Main Title & Property Strip */}
              <div className="p-6 space-y-5 bg-card/20">
                {/* Editable Title */}
                <div>
                  {isEditingTitle ? (
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onBlur={handleSaveTitle}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveTitle();
                        if (e.key === 'Escape') setIsEditingTitle(false);
                      }}
                      autoFocus
                      className="text-xl font-bold px-3 py-2 h-auto"
                    />
                  ) : (
                    <h2
                      onClick={() => setIsEditingTitle(true)}
                      className="text-xl sm:text-2xl font-bold text-foreground cursor-pointer hover:bg-secondary/40 px-2 -mx-2 py-1 rounded-xl transition-colors leading-snug"
                      title="Click to edit title"
                    >
                      {task.title}
                    </h2>
                  )}
                </div>

                {/* Property Grid (Linear Style) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Status */}
                  <div className="p-2.5 rounded-xl border border-border/60 bg-card space-y-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                      Status
                    </span>
                    <select
                      value={task.status}
                      onChange={(e) =>
                        updateTaskMutation.mutate({
                          id: task.id,
                          data: { status: e.target.value as TaskStatus },
                        })
                      }
                      className="w-full text-xs font-semibold bg-transparent border-0 p-0 text-foreground focus:outline-none cursor-pointer"
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="IN_REVIEW">In Review</option>
                      <option value="DONE">Done</option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div className="p-2.5 rounded-xl border border-border/60 bg-card space-y-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                      Priority
                    </span>
                    <select
                      value={task.priority}
                      onChange={(e) =>
                        updateTaskMutation.mutate({
                          id: task.id,
                          data: { priority: e.target.value as TaskPriority },
                        })
                      }
                      className="w-full text-xs font-semibold bg-transparent border-0 p-0 text-foreground focus:outline-none cursor-pointer"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>

                  {/* Due Date */}
                  <div className="p-2.5 rounded-xl border border-border/60 bg-card space-y-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                      Due Date
                    </span>
                    <input
                      type="date"
                      value={task.dueDate ? task.dueDate.split('T')[0] : ''}
                      onChange={(e) =>
                        updateTaskMutation.mutate({
                          id: task.id,
                          data: { dueDate: e.target.value ? new Date(e.target.value).toISOString() : null },
                        })
                      }
                      className="w-full text-xs font-medium bg-transparent border-0 p-0 text-foreground focus:outline-none cursor-pointer"
                    />
                  </div>

                  {/* Estimated Time */}
                  <div className="p-2.5 rounded-xl border border-border/60 bg-card space-y-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                      Estimate (Hours)
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      placeholder="e.g. 4"
                      value={task.estimatedHours ?? ''}
                      onChange={(e) =>
                        updateTaskMutation.mutate({
                          id: task.id,
                          data: { estimatedHours: e.target.value ? Number(e.target.value) : undefined },
                        })
                      }
                      className="w-full text-xs font-medium bg-transparent border-0 p-0 text-foreground focus:outline-none"
                    />
                  </div>
                </div>

                {/* Assignees & Labels Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Assignees */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">Assignees</span>
                      <button
                        type="button"
                        onClick={() => setShowAddAssignee(!showAddAssignee)}
                        className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                      >
                        <UserPlus className="w-3 h-3" /> Assign
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 items-center">
                      {task.assignees?.map((a) => (
                        <div
                          key={a.id}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-card border border-border text-xs"
                        >
                          <UserAvatar user={a.user} size="xs" />
                          <span className="font-medium text-foreground truncate max-w-[120px]">
                            {a.user?.name || a.user?.email}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeUserMutation.mutate(a.userId)}
                            className="text-muted-foreground hover:text-destructive p-0.5 ml-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      {(!task.assignees || task.assignees.length === 0) && (
                        <span className="text-xs text-muted-foreground italic">No assignees yet</span>
                      )}
                    </div>

                    {/* Add Assignee Dropdown */}
                    {showAddAssignee && (
                      <div className="mt-2 p-2 rounded-xl bg-card border border-border shadow-lg space-y-1 max-h-36 overflow-y-auto">
                        {unassignedMembers.map((m) => (
                          <button
                            key={m.userId}
                            type="button"
                            onClick={() => {
                              assignUserMutation.mutate(m.userId);
                              setShowAddAssignee(false);
                            }}
                            className="w-full flex items-center gap-2 p-1.5 text-xs rounded-lg hover:bg-secondary text-left font-medium"
                          >
                            <UserAvatar user={m.user} size="xs" />
                            <span className="truncate">{m.user?.name || m.user?.email}</span>
                          </button>
                        ))}
                        {unassignedMembers.length === 0 && (
                          <p className="text-[11px] text-muted-foreground text-center py-2">
                            All members assigned
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Labels */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">Labels</span>
                      <button
                        type="button"
                        onClick={() => setShowAddLabel(!showAddLabel)}
                        className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                      >
                        <Tag className="w-3 h-3" /> Add
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 items-center">
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
                            type="button"
                            onClick={() => removeLabelMutation.mutate(tl.labelId)}
                            className="hover:opacity-75"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}

                      {(!task.labels || task.labels.length === 0) && (
                        <span className="text-xs text-muted-foreground italic">No labels</span>
                      )}
                    </div>

                    {/* Add / Create Label Popover */}
                    {showAddLabel && (
                      <div className="mt-2 p-3 rounded-xl bg-card border border-border shadow-lg space-y-3">
                        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                          {unassignedLabels.map((lbl) => (
                            <button
                              key={lbl.id}
                              type="button"
                              onClick={() => {
                                assignLabelMutation.mutate(lbl.id);
                                setShowAddLabel(false);
                              }}
                              className="text-[11px] font-medium px-2 py-0.5 rounded-full border hover:opacity-80"
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

                        <form onSubmit={handleCreateAndAssignLabel} className="space-y-2 pt-2 border-t border-border">
                          <div className="flex gap-2">
                            <Input
                              value={newLabelName}
                              onChange={(e) => setNewLabelName(e.target.value)}
                              placeholder="New label"
                              className="h-7 text-xs"
                            />
                            <input
                              type="color"
                              value={newLabelColor}
                              onChange={(e) => setNewLabelColor(e.target.value)}
                              className="w-7 h-7 rounded-lg cursor-pointer border p-0.5"
                            />
                          </div>
                          <Button
                            type="submit"
                            size="sm"
                            disabled={!newLabelName.trim()}
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

              {/* Description */}
              <div className="p-6 space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={handleSaveDescription}
                  placeholder="Add context, details, or checklist items (- [ ] item)..."
                  rows={4}
                  className="w-full p-3.5 rounded-xl border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none leading-relaxed"
                />
              </div>

              {/* Interactive Checklist & Subtasks Section */}
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                      Checklist & Subtasks ({completedChecklistCount}/{checklistItems.length})
                    </span>
                  </div>
                  {checklistItems.length > 0 && (
                    <span className="text-xs font-bold text-muted-foreground">
                      {checklistPercentage}%
                    </span>
                  )}
                </div>

                {checklistItems.length > 0 && (
                  <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300 rounded-full"
                      style={{ width: `${checklistPercentage}%` }}
                    />
                  </div>
                )}

                {/* Checklist items list */}
                <div className="space-y-1.5 pt-1">
                  {checklistItems.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleToggleChecklistItem(item.lineIndex, item.completed)}
                      className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-secondary/40 cursor-pointer transition-colors group/item"
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => {}}
                        className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer accent-primary"
                      />
                      <span
                        className={cn(
                          'text-xs text-foreground/90 flex-1 leading-relaxed',
                          item.completed && 'line-through text-muted-foreground/70'
                        )}
                      >
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Add new checklist item inline form */}
                <form onSubmit={handleAddChecklistItem} className="flex gap-2 pt-2">
                  <Input
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    placeholder="Add a new checklist item..."
                    className="h-8 text-xs flex-1"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!newChecklistText.trim()}
                    className="h-8 px-3 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add
                  </Button>
                </form>
              </div>

              {/* Tabs: Comments, Attachments, Activity */}
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4 border-b border-border/80 pb-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('comments')}
                    className={cn(
                      'flex items-center gap-2 text-xs font-semibold pb-2 border-b-2 transition-all',
                      activeTab === 'comments'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Comments ({commentsData?.items?.length ?? task._count?.comments ?? 0})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('attachments')}
                    className={cn(
                      'flex items-center gap-2 text-xs font-semibold pb-2 border-b-2 transition-all',
                      activeTab === 'attachments'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>Attachments ({attachmentsData?.items?.length ?? task._count?.attachments ?? 0})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('activity')}
                    className={cn(
                      'flex items-center gap-2 text-xs font-semibold pb-2 border-b-2 transition-all',
                      activeTab === 'activity'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Activity</span>
                  </button>
                </div>

                {/* Tab 1: Comments */}
                {activeTab === 'comments' && (
                  <div className="space-y-4 pt-1">
                    <form onSubmit={handleAddComment} className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Write a comment..."
                          className="text-xs h-9"
                        />
                        <Button
                          type="submit"
                          size="sm"
                          disabled={!newComment.trim()}
                          isLoading={createCommentMutation.isPending}
                          className="h-9 px-3.5 text-xs font-semibold shrink-0"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </form>

                    <div className="space-y-3 mt-4">
                      {commentsData?.items?.map((c) => (
                        <div
                          key={c.id}
                          className="p-3.5 rounded-xl bg-card border border-border text-sm"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <UserAvatar user={c.user} size="xs" />
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
                                type="button"
                                onClick={() => deleteCommentMutation.mutate(c.id)}
                                className="text-muted-foreground hover:text-destructive transition-colors p-1"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed text-xs">
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

                {/* Tab 2: Attachments */}
                {activeTab === 'attachments' && (
                  <div className="space-y-4 pt-1">
                    <AttachmentUploadZone taskId={task.id} />

                    <div className="space-y-2 mt-4">
                      {attachmentsData?.items?.map((att) => {
                        const cat = getAttachmentCategory(att.fileName, att.mimeType);
                        return (
                          <div
                            key={att.id}
                            className="group flex items-center justify-between p-3 rounded-xl bg-card hover:bg-secondary/40 border border-border transition-all text-xs"
                          >
                            <div
                              onClick={() => {
                                setPreviewAttachment(att);
                                setIsPreviewOpen(true);
                              }}
                              className="flex items-center gap-3 min-w-0 truncate cursor-pointer flex-1 mr-2"
                              title="Click to preview file"
                            >
                              {cat === 'image' && att.fileUrl ? (
                                <div className="w-10 h-10 rounded-xl overflow-hidden border border-border shrink-0 bg-secondary/30 relative">
                                  <img
                                    src={getAssetUrl(att.fileUrl)}
                                    alt={att.fileName}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-9 h-9 rounded-xl bg-background border border-border flex items-center justify-center shrink-0">
                                  {renderAttachmentIcon(cat)}
                                </div>
                              )}
                              <div className="truncate min-w-0">
                                <p className="font-semibold text-foreground truncate group-hover:text-primary transition-colors flex items-center gap-1.5">
                                  <span>{att.fileName}</span>
                                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-bold bg-secondary text-muted-foreground border border-border/50">
                                    {cat}
                                  </span>
                                </p>
                                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                                  {formatFileSize(att.fileSize)} •{' '}
                                  {att.uploader?.name || att.uploader?.email || 'Uploaded'} •{' '}
                                  {new Date(att.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setPreviewAttachment(att);
                                  setIsPreviewOpen(true);
                                }}
                                className="h-8 px-2.5 rounded-lg text-xs gap-1 font-medium"
                              >
                                <Eye className="w-3.5 h-3.5 text-primary" />
                                <span className="hidden sm:inline">Preview</span>
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadAttachment(att)}
                                className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyAttachmentLink(att)}
                                className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground"
                              >
                                {copiedAttachmentId === att.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setAttachmentToDelete(att.id)}
                                className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}

                      {(!attachmentsData?.items || attachmentsData.items.length === 0) && (
                        <div className="text-center py-8 px-4 rounded-xl border border-dashed border-border/60 bg-secondary/10">
                          <Paperclip className="w-5 h-5 mx-auto text-muted-foreground/60 mb-2" />
                          <p className="text-xs font-medium text-foreground">No attachments yet</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Upload documents and assets above
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab 3: Activity & History */}
                {activeTab === 'activity' && (
                  <div className="space-y-4 pt-1">
                    <div className="space-y-4 relative pl-5 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                      <div className="relative space-y-0.5">
                        <span className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background" />
                        <p className="text-xs font-semibold text-foreground">Task created</p>
                        <p className="text-[11px] text-muted-foreground">
                          {new Date(task.createdAt).toLocaleString()}
                        </p>
                      </div>

                      {task.updatedAt && task.updatedAt !== task.createdAt && (
                        <div className="relative space-y-0.5">
                          <span className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-background" />
                          <p className="text-xs font-semibold text-foreground">Task modified</p>
                          <p className="text-[11px] text-muted-foreground">
                            {new Date(task.updatedAt).toLocaleString()}
                          </p>
                        </div>
                      )}

                      {task.status === 'DONE' && (
                        <div className="relative space-y-0.5">
                          <span className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-background" />
                          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            Task marked as Done
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Completed stage reached
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

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

      {/* Delete Attachment Confirmation */}
      <ConfirmDialog
        open={Boolean(attachmentToDelete)}
        onOpenChange={(open) => !open && setAttachmentToDelete(null)}
        title="Delete Attachment"
        description="Are you sure you want to delete this attachment? This action cannot be undone."
        confirmText="Delete Attachment"
        variant="destructive"
        onConfirm={() => {
          if (attachmentToDelete) {
            deleteAttachmentMutation.mutate(attachmentToDelete, {
              onSuccess: () => setAttachmentToDelete(null),
            });
          }
        }}
      />

      {/* Enterprise Attachment Preview Modal */}
      <AttachmentPreviewModal
        attachment={previewAttachment}
        allAttachments={attachmentsData?.items || []}
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        onSelectAttachment={(att) => setPreviewAttachment(att)}
      />
    </div>
  );
}
