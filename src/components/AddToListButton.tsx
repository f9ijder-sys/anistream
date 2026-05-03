import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Loader2, ChevronDown, Eye, Clock, Heart, X } from 'lucide-react';
import { useAuth } from '@adaptive-ai/sdk/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { client } from '@/lib/client';

const STATUS_OPTIONS = [
  { value: 'watching', label: 'Смотрю сейчас', icon: Eye, color: 'text-blue-400' },
  { value: 'completed', label: 'Просмотрено', icon: Check, color: 'text-green-400' },
  { value: 'plan_to_watch', label: 'Буду смотреть', icon: Clock, color: 'text-yellow-400' },
  { value: 'favorite', label: 'Любимые', icon: Heart, color: 'text-pink-400' },
] as const;

interface Props {
  animeId: number;
  animeTitle: string;
  animePoster: string;
}

export function AddToListButton({ animeId, animeTitle, animePoster }: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const auth = useAuth({ required: false });
  const qc = useQueryClient();

  const { data: currentStatus, isLoading } = useQuery({
    queryKey: ['animeStatus', animeId],
    queryFn: () => client.getAnimeStatus(animeId),
    enabled: auth.status === 'authenticated',
  });

  const addMutation = useMutation({
    mutationFn: (status: string) =>
      client.addToList(animeId, animeTitle, animePoster, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['animeStatus', animeId] });
      qc.invalidateQueries({ queryKey: ['userList'] });
      setDropdownOpen(false);
    },
  });

  const removeMutation = useMutation({
    mutationFn: () => client.removeFromList(animeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['animeStatus', animeId] });
      qc.invalidateQueries({ queryKey: ['userList'] });
      setDropdownOpen(false);
    },
  });

  if (auth.status === 'unauthenticated') {
    return (
      <button
        onClick={() => auth.signIn()}
        className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-purple-500/30 text-sm text-purple-300 hover:text-white hover:border-purple-400 transition-all"
      >
        <Plus className="w-4 h-4" />
        В список
      </button>
    );
  }

  const activeOption = STATUS_OPTIONS.find((o) => o.value === currentStatus);
  const isPending = addMutation.isPending || removeMutation.isPending || isLoading;

  return (
    <div className="relative">
      <div className="flex items-stretch">
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          disabled={isPending}
          className={`flex items-center gap-2 px-4 py-2 rounded-l-xl text-sm font-medium transition-all border-y border-l ${
            activeOption
              ? 'bg-purple-600/20 border-purple-500/40 text-purple-300'
              : 'glass border-purple-500/30 text-gray-300 hover:text-white hover:border-purple-400'
          }`}
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : activeOption ? (
            <activeOption.icon className={`w-4 h-4 ${activeOption.color}`} />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          {activeOption ? activeOption.label : 'В список'}
        </button>

        {activeOption ? (
          <button
            onClick={() => removeMutation.mutate()}
            disabled={isPending}
            className="flex items-center px-2 py-2 rounded-r-xl glass border border-purple-500/30 text-gray-500 hover:text-red-400 hover:border-red-500/40 transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center px-2 py-2 rounded-r-xl glass border border-purple-500/30 text-gray-400 hover:text-white transition-all"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-1 w-48 glass-strong rounded-xl border border-purple-500/20 shadow-xl z-50 overflow-hidden"
          >
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => addMutation.mutate(opt.value)}
                disabled={addMutation.isPending}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-purple-500/10 ${
                  currentStatus === opt.value ? 'bg-purple-500/10 text-white' : 'text-gray-300'
                }`}
              >
                <opt.icon className={`w-4 h-4 ${opt.color}`} />
                {opt.label}
                {currentStatus === opt.value && <Check className="w-3 h-3 ml-auto text-purple-400" />}
              </button>
            ))}

            {currentStatus && (
              <>
                <div className="h-px bg-white/5 mx-2" />
                <button
                  onClick={() => removeMutation.mutate()}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Удалить из списка
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {dropdownOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
      )}
    </div>
  );
}
