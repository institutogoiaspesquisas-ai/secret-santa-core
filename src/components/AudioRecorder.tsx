import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Loader2, Play, Pause } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AudioRecorderProps {
  onTranscript: (transcript: string) => void;
  onAudioUrl: (url: string) => void;
  groupId: string;
  userId: string;
  disabled?: boolean;
}

export function AudioRecorder({ onTranscript, onAudioUrl, groupId, userId, disabled }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: 'Error',
        description: 'No se pudo acceder al micrófono. Por favor, permite el acceso.',
        variant: 'destructive',
      });
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const playAudio = useCallback(() => {
    if (audioBlob && !isPlaying) {
      const url = URL.createObjectURL(audioBlob);
      const audio = new Audio(url);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
      };
      
      audio.play();
      setIsPlaying(true);
    } else if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [audioBlob, isPlaying]);

  const processAudio = useCallback(async () => {
    if (!audioBlob) return;

    setIsProcessing(true);
    try {
      // Upload to storage
      const fileName = `${groupId}/${userId}/${Date.now()}.webm`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-audios')
        .upload(fileName, audioBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-audios')
        .getPublicUrl(fileName);

      onAudioUrl(publicUrl);

      // Convert to base64 and transcribe
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        
        const { data, error } = await supabase.functions.invoke('transcribe-audio', {
          body: { audio: base64 },
        });

        if (error) throw error;
        
        onTranscript(data.text);
        toast({
          title: 'Éxito',
          description: 'Audio procesado correctamente.',
        });
      };
      reader.readAsDataURL(audioBlob);

    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        title: 'Error',
        description: 'No se pudo procesar el audio. Intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [audioBlob, groupId, userId, onAudioUrl, onTranscript]);

  return (
    <div className="flex flex-col items-center gap-4 p-6 border rounded-lg bg-card">
      <p className="text-sm text-muted-foreground text-center">
        Graba un mensaje de voz presentándote al grupo
      </p>
      
      <div className="flex items-center gap-3">
        {!isRecording ? (
          <Button
            onClick={startRecording}
            disabled={disabled || isProcessing}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <Mic className="h-5 w-5" />
            Grabar
          </Button>
        ) : (
          <Button
            onClick={stopRecording}
            variant="destructive"
            size="lg"
            className="gap-2 animate-pulse"
          >
            <Square className="h-5 w-5" />
            Detener
          </Button>
        )}

        {audioBlob && !isRecording && (
          <>
            <Button
              onClick={playAudio}
              variant="secondary"
              size="lg"
              className="gap-2"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              {isPlaying ? 'Pausar' : 'Escuchar'}
            </Button>
            
            <Button
              onClick={processAudio}
              disabled={isProcessing}
              size="lg"
              className="gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Procesando...
                </>
              ) : (
                'Usar este audio'
              )}
            </Button>
          </>
        )}
      </div>

      {isRecording && (
        <div className="flex items-center gap-2 text-destructive">
          <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
          <span className="text-sm">Grabando...</span>
        </div>
      )}
    </div>
  );
}
