export interface ScheduleRequest {
  empleadoId: string;
  startTime: string | null;
  endTime: string | null;
  lunchStartTime: string | null;
  lunchEndTime: string | null;
  vacation: boolean;
}

export interface ScheduleResponse {
  id: number;
  empleadoId: string;
  startTime: string | null;
  endTime: string | null;
  lunchStartTime: string | null;
  lunchEndTime: string | null;
  vacation: boolean;
}