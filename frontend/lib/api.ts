const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `API error ${res.status}`);
  return data as T;
}

// ---- Meetings ----
export async function getMeetings() {
  return apiFetch<Meeting[]>('/meetings');
}

export async function getMeeting(id: string) {
  return apiFetch<Meeting>(`/meetings/${id}`);
}

export async function submitText(transcript: string) {
  return apiFetch<SubmitResult>('/meetings/text', {
    method: 'POST',
    body: JSON.stringify({ transcript }),
  });
}

export async function uploadAudio(formData: FormData) {
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Upload error ${res.status}`);
  return data as SubmitResult;
}

export async function deleteMeeting(id: string) {
  return apiFetch<{ message: string }>(`/meetings/${id}`, { method: 'DELETE' });
}

// ---- Tasks ----
export async function getTasks(filters: TaskFilters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.priority) params.set('priority', filters.priority);
  if (filters.owner) params.set('owner', filters.owner);
  if (filters.member) params.set('member', filters.member);
  if (filters.meetingId) params.set('meetingId', filters.meetingId);
  const qs = params.toString();
  return apiFetch<{ tasks: Task[]; total: number }>(`/tasks${qs ? `?${qs}` : ''}`);
}

export async function getTask(id: string) {
  return apiFetch<Task>(`/tasks/${id}`);
}

export async function updateTask(id: string, updates: Partial<Task>) {
  return apiFetch<Task>(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export async function deleteTask(id: string) {
  return apiFetch<{ message: string }>(`/tasks/${id}`, { method: 'DELETE' });
}

// ---- Agent ----
export async function runAgent() {
  return apiFetch<{ message: string }>('/tasks/agent/run', { method: 'POST' });
}

export async function getAgentMessages() {
  return apiFetch<Task[]>('/tasks/agent/messages');
}

// ---- Types ----
export interface Task {
  _id: string;
  task_id: string;
  description: string;
  owner: string;
  member: string;
  deadline: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'done';
  estimated_duration_hours: number;
  confidence: number;
  agentMessages: AgentMessage[];
  meeting?: { _id: string; title: string; created_at: string } | string;
  created_at: string;
}

export interface Meeting {
  _id: string;
  title: string;
  summary: string;
  transcript: string;
  tasks: Task[];
  audioFile: string | null;
  created_at: string;
}

export interface AgentMessage {
  message: string;
  generatedAt: string;
}

export interface SubmitResult {
  meeting: { id: string; title: string; summary: string; taskCount: number };
  tasks: Task[];
}

export interface TaskFilters {
  status?: string;
  priority?: string;
  owner?: string;
  member?: string;
  meetingId?: string;
}
