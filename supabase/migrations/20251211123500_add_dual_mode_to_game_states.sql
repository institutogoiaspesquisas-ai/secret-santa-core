-- Migration: Add dual mode fields to game_states table
-- Description: Adds fields to support dual-player final round mode
ALTER TABLE game_states
ADD COLUMN IF NOT EXISTS is_dual_mode BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS dual_player_left_id UUID REFERENCES user_profiles(id),
    ADD COLUMN IF NOT EXISTS dual_player_right_id UUID REFERENCES user_profiles(id),
    ADD COLUMN IF NOT EXISTS dual_hint_index_left INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS dual_hint_index_right INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS dual_guess_left UUID REFERENCES user_profiles(id),
    ADD COLUMN IF NOT EXISTS dual_guess_right UUID REFERENCES user_profiles(id);
-- Add comment explaining the dual mode fields
COMMENT ON COLUMN game_states.is_dual_mode IS 'Flag indicating if the game is in dual-player final round mode';
COMMENT ON COLUMN game_states.dual_player_left_id IS 'User ID of the player on the left side in dual mode';
COMMENT ON COLUMN game_states.dual_player_right_id IS 'User ID of the player on the right side in dual mode';
COMMENT ON COLUMN game_states.dual_hint_index_left IS 'Current hint index (0-3) for left player in dual mode';
COMMENT ON COLUMN game_states.dual_hint_index_right IS 'Current hint index (0-3) for right player in dual mode';
COMMENT ON COLUMN game_states.dual_guess_left IS 'User ID of the guess for left player in dual mode';
COMMENT ON COLUMN game_states.dual_guess_right IS 'User ID of the guess for right player in dual mode';