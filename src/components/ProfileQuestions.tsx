import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PROFILE_QUESTIONS, ProfileAnswers } from '@/constants/profileQuestions';

interface ProfileQuestionsProps {
  initialAnswers?: Partial<ProfileAnswers>;
  onSubmit: (answers: ProfileAnswers) => void;
  disabled?: boolean;
}

export function ProfileQuestions({ initialAnswers = {}, onSubmit, disabled }: ProfileQuestionsProps) {
  const [answers, setAnswers] = useState<Partial<ProfileAnswers>>(initialAnswers);

  const handleChange = (id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(answers as ProfileAnswers);
  };

  const isComplete = PROFILE_QUESTIONS.every(q => answers[q.id]?.trim());

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {PROFILE_QUESTIONS.map((q) => (
        <div key={q.id} className="space-y-2">
          <Label htmlFor={q.id} className="text-base font-medium">
            {q.question}
          </Label>
          <Input
            id={q.id}
            value={answers[q.id] || ''}
            onChange={(e) => handleChange(q.id, e.target.value)}
            placeholder={q.placeholder}
            disabled={disabled}
            className="text-base"
          />
        </div>
      ))}
      
      <Button type="submit" disabled={!isComplete || disabled} className="w-full">
        Guardar respuestas
      </Button>
    </form>
  );
}
