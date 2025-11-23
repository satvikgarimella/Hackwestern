use anchor_lang::prelude::*;

declare_id!("GYzboJk8vMriHVHHcVB1jkcgvjjx2E3p9taf6sMYtKAQ"); // replace after deploy

// === Size limits for on-chain storage ===
const MAX_QUESTION_LEN: usize = 256;
const MAX_OPTION_LEN: usize = 64;
const MAX_OPTIONS: usize = 4;

#[program]
pub mod govai_polls {
    use super::*;

    // Create a new poll
    pub fn create_poll(
        ctx: Context<CreatePoll>,
        question: String,
        options: Vec<String>,
        start_slot: u64,
        end_slot: u64,
    ) -> Result<()> {
        // 1) Basic rules
        require!(options.len() >= 2, GovError::NotEnoughOptions);
        require!(start_slot < end_slot, GovError::InvalidTimeRange);
        require!(options.len() <= MAX_OPTIONS, GovError::TooManyOptions);

        // 2) Length checks to keep us inside our fixed buffers
        let q_bytes = question.as_bytes();
        require!(q_bytes.len() <= MAX_QUESTION_LEN, GovError::InvalidQuestionLen);

        for opt in &options {
            let ob = opt.as_bytes();
            require!(
                ob.len() <= MAX_OPTION_LEN,
                GovError::InvalidOptionLen
            );
        }

        // 3) Copy question into fixed-size array
        let mut question_buf = [0u8; MAX_QUESTION_LEN];
        question_buf[..q_bytes.len()].copy_from_slice(q_bytes);

        // 4) Copy options into fixed-size 2D array
        let mut options_buf = [[0u8; MAX_OPTION_LEN]; MAX_OPTIONS];
        for (i, opt) in options.iter().enumerate() {
            let ob = opt.as_bytes();
            options_buf[i][..ob.len()].copy_from_slice(ob);
        }

        // 5) Write into the poll account
        let poll = &mut ctx.accounts.poll;
        poll.creator = ctx.accounts.creator.key();
        poll.question = question_buf;
        poll.options = options_buf;
        poll.num_options = options.len() as u8;
        poll.start_slot = start_slot;
        poll.end_slot = end_slot;
        poll.bump = ctx.bumps.poll;

        Ok(())
    }

    // Cast a vote – one vote per (poll, voter)
    pub fn cast_vote(ctx: Context<CastVote>, choice_index: u8) -> Result<()> {
        let poll = &ctx.accounts.poll;
        let clock = Clock::get()?;

        // poll must be active
        require!(
            clock.slot >= poll.start_slot && clock.slot <= poll.end_slot,
            GovError::PollNotActive
        );

        // choice index must be valid (use num_options, not fixed MAX_OPTIONS)
        require!(
            choice_index < poll.num_options,
            GovError::InvalidChoice
        );

        // create the on-chain VoteRecord
        let vote = &mut ctx.accounts.vote_record;
        vote.poll = poll.key();
        vote.voter = ctx.accounts.voter.key();
        vote.choice_index = choice_index;
        vote.weight = 1; // 1-wallet-1-vote for now

        Ok(())
    }
}

// =========================
// Account validation structs
// =========================

#[derive(Accounts)]
#[instruction(question: String)]
pub struct CreatePoll<'info> {
    #[account(
        init,
        payer = creator,
        // account size (bytes)
        space = 8 // discriminator
            + 32                                // creator pubkey
            + MAX_QUESTION_LEN                  // fixed question bytes
            + (MAX_OPTIONS * MAX_OPTION_LEN)    // fixed option bytes
            + 1                                 // num_options
            + 8                                 // start_slot
            + 8                                 // end_slot
            + 1,                                // bump
        seeds = [b"poll", b"v999", creator.key().as_ref(), question.as_bytes()],
        bump
    )]
    pub poll: Account<'info, Poll>,

    #[account(mut)]
    pub creator: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CastVote<'info> {
    #[account(mut)]
    pub poll: Account<'info, Poll>,

    #[account(
        init,
        payer = voter,
        space = 8  // discriminator
            + 32  // poll pubkey
            + 32  // voter pubkey
            + 1   // choice_index
            + 8,  // weight
        seeds = [b"vote", poll.key().as_ref(), voter.key().as_ref()],
        bump
    )]
    pub vote_record: Account<'info, VoteRecord>,

    #[account(mut)]
    pub voter: Signer<'info>,

    pub system_program: Program<'info, System>,
}

// =========================
// On-chain data structures
// =========================

// poll data stored on-chain
#[account]
pub struct Poll {
    pub creator: Pubkey,
    pub question: [u8; MAX_QUESTION_LEN],               // fixed-size UTF-8 buffer
    pub options: [[u8; MAX_OPTION_LEN]; MAX_OPTIONS],   // up to MAX_OPTIONS answers
    pub num_options: u8,                                // how many are actually used
    pub start_slot: u64,
    pub end_slot: u64,
    pub bump: u8,
}

// vote stored on-chain – this IS the vote
#[account]
pub struct VoteRecord {
    pub poll: Pubkey,
    pub voter: Pubkey,
    pub choice_index: u8,
    pub weight: u64,
}

// =========================
// Errors
// =========================

#[error_code]
pub enum GovError {
    #[msg("Poll must have at least 2 options.")]
    NotEnoughOptions,
    #[msg("Poll start/end slots are invalid.")]
    InvalidTimeRange,
    #[msg("Poll is not active.")]
    PollNotActive,
    #[msg("Choice index is invalid.")]
    InvalidChoice,
    #[msg("Question is too long.")]
    InvalidQuestionLen,
    #[msg("Option text is too long.")]
    InvalidOptionLen,
    #[msg("Too many options.")]
    TooManyOptions,
}


#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn idl_test() {
        // This test does nothing. Anchor uses it to generate the IDL.
        assert!(true);
    }
}
