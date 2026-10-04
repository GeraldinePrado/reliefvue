use anchor_lang::prelude::*;
declare_id!("Fg6PaFpoGXkYsidMpWxTWqkZ7FEfcYkgMQhgN3tR9Y4");

#[program]
pub mod relief_reserve {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>, verifier: Pubkey) -> Result<()> {
        let r = &mut ctx.accounts.reserve;
        let reviewer = ctx.accounts.reviewer.key();
        let primary = ctx.accounts.primary.key();
        let backup = ctx.accounts.backup.key();
        require!(reviewer != primary && reviewer != backup && primary != backup, Fault::Roles);
        require!(verifier != Pubkey::default(), Fault::Roles);
        r.reviewer = reviewer; r.primary = primary; r.backup = backup;
        r.verifier = verifier; r.outstanding = 0; r.bump = ctx.bumps.reserve;
        Ok(())
    }
    pub fn create_event(ctx: Context<CreateEvent>, id: [u8;32], area: [u8;32], grant: u64, budget: u64, hold: u64) -> Result<()> {
        authorize(&ctx.accounts.reserve, ctx.accounts.reviewer.key(), ctx.accounts.approver.key())?;
        require!(grant > 0 && budget >= grant && hold <= budget, Fault::Terms);
        let r = &mut ctx.accounts.reserve;
        commit(r, budget)?;
        let e = &mut ctx.accounts.event;
        e.reserve = r.key(); e.id = id; e.area = area; e.grant = grant;
        e.budget = budget; e.hold = hold; e.bump = ctx.bumps.event;
        Ok(())
    }
    // Terms are immutable. Both signers may only add regular/review allocation.
    pub fn increase_event(ctx: Context<IncreaseEvent>, additional: u64, additional_hold: u64) -> Result<()> {
        authorize(&ctx.accounts.reserve, ctx.accounts.reviewer.key(), ctx.accounts.approver.key())?;
        require!(additional > 0 && additional_hold <= additional, Fault::Terms);
        commit(&mut ctx.accounts.reserve, additional)?;
        let e = &mut ctx.accounts.event;
        e.budget = add(e.budget, additional)?;
        e.hold = add(e.hold, additional_hold)?;
        Ok(())
    }
    pub fn bind_entitlement(ctx: Context<BindEntitlement>, token: [u8;32], area: [u8;32], reviewed: bool) -> Result<()> {
        require_keys_eq!(ctx.accounts.verifier.key(), ctx.accounts.reserve.verifier, Fault::Unauthorized);
        let e = &mut ctx.accounts.event;
        require!(e.area == area, Fault::Area);
        require!(token != [0;32], Fault::Terms);
        if reviewed {
            e.review_allocated = allocate(e.review_allocated, e.grant, e.hold)?;
        } else {
            e.regular_allocated = allocate(e.regular_allocated, e.grant, sub(e.budget,e.hold)?)?;
        }
        let t = &mut ctx.accounts.entitlement;
        t.event = e.key(); t.token = token; t.recipient = ctx.accounts.recipient.key();
        t.amount = e.grant; t.reviewed = reviewed; t.consumed = false;
        Ok(())
    }
    pub fn claim(ctx: Context<Claim>) -> Result<()> {
        let e = &mut ctx.accounts.event;
        let t = &mut ctx.accounts.entitlement;
        require!(!t.consumed, Fault::Consumed);
        require_keys_eq!(t.recipient,ctx.accounts.recipient.key(),Fault::Recipient);
        require!(t.amount == e.grant, Fault::Terms);
        let next_paid = allocate(e.paid,t.amount,e.budget)?;
        let r = &mut ctx.accounts.reserve;
        let remaining = sub(r.outstanding,t.amount)?;
        let reserve_info = r.to_account_info();
        let recipient_info = ctx.accounts.recipient.to_account_info();
        let rent = Rent::get()?.minimum_balance(reserve_info.data_len());
        let remaining_lamports = sub(reserve_info.lamports(),t.amount)?;
        require!(remaining_lamports >= add(rent,remaining)?,Fault::Funds);
        let recipient_balance = add(recipient_info.lamports(),t.amount)?;
        // Runtime rolls all state and lamport mutations back if this instruction fails.
        t.consumed = true; e.paid = next_paid; r.outstanding = remaining;
        **reserve_info.try_borrow_mut_lamports()? = remaining_lamports;
        **recipient_info.try_borrow_mut_lamports()? = recipient_balance;
        Ok(())
    }
}
fn authorize(r: &Reserve, reviewer: Pubkey, approver: Pubkey) -> Result<()> {
    require!(reviewer == r.reviewer && reviewer != approver &&
        (approver == r.primary || approver == r.backup), Fault::Unauthorized);
    Ok(())
}
fn add(a:u64,b:u64)->Result<u64>{a.checked_add(b).ok_or(error!(Fault::Arithmetic))}
fn sub(a:u64,b:u64)->Result<u64>{a.checked_sub(b).ok_or(error!(Fault::Arithmetic))}
fn allocate(used:u64, amount:u64, cap:u64)->Result<u64>{
    let next=add(used,amount)?; require!(next<=cap,Fault::Cap); Ok(next)
}
fn commit(r: &mut Account<Reserve>,amount:u64)->Result<()>{
    let outstanding=add(r.outstanding,amount)?;
    let info=r.to_account_info();
    let rent=Rent::get()?.minimum_balance(info.data_len());
    require!(info.lamports() >= add(rent,outstanding)?,Fault::Funds);
    r.outstanding=outstanding; Ok(())
}
#[derive(Accounts)]
pub struct Initialize<'info>{
    #[account(mut)] pub reviewer: Signer<'info>,
    pub primary: Signer<'info>, pub backup: Signer<'info>,
    #[account(init,payer=reviewer,space=8+Reserve::INIT_SPACE,seeds=[b"reserve",reviewer.key().as_ref()],bump)]
    pub reserve: Account<'info,Reserve>,
    pub system_program: Program<'info,System>,
}
#[derive(Accounts)]
#[instruction(id:[u8;32])]
pub struct CreateEvent<'info>{
    #[account(mut,seeds=[b"reserve",reserve.reviewer.as_ref()],bump=reserve.bump)] pub reserve: Account<'info,Reserve>,
    #[account(mut)] pub reviewer: Signer<'info>, pub approver: Signer<'info>,
    #[account(init,payer=reviewer,space=8+ReliefEvent::INIT_SPACE,seeds=[b"event",reserve.key().as_ref(),id.as_ref()],bump)]
    pub event: Account<'info,ReliefEvent>,
    pub system_program: Program<'info,System>,
}
#[derive(Accounts)]
pub struct IncreaseEvent<'info>{
    #[account(mut,seeds=[b"reserve",reserve.reviewer.as_ref()],bump=reserve.bump)] pub reserve: Account<'info,Reserve>,
    pub reviewer: Signer<'info>, pub approver: Signer<'info>,
    #[account(mut,has_one=reserve,seeds=[b"event",reserve.key().as_ref(),event.id.as_ref()],bump=event.bump)]
    pub event: Account<'info,ReliefEvent>,
}
#[derive(Accounts)]
#[instruction(token:[u8;32])]
pub struct BindEntitlement<'info>{
    #[account(seeds=[b"reserve",reserve.reviewer.as_ref()],bump=reserve.bump)] pub reserve: Account<'info,Reserve>,
    #[account(mut)] pub verifier: Signer<'info>,
    #[account(mut,has_one=reserve,seeds=[b"event",reserve.key().as_ref(),event.id.as_ref()],bump=event.bump)] pub event: Account<'info,ReliefEvent>,
    pub recipient: SystemAccount<'info>,
    #[account(init,payer=verifier,space=8+Entitlement::INIT_SPACE,seeds=[b"entitlement",event.key().as_ref(),token.as_ref()],bump)]
    pub entitlement: Account<'info,Entitlement>,
    pub system_program: Program<'info,System>,
}
#[derive(Accounts)]
pub struct Claim<'info>{
    #[account(mut,seeds=[b"reserve",reserve.reviewer.as_ref()],bump=reserve.bump)] pub reserve: Account<'info,Reserve>,
    #[account(mut,has_one=reserve,seeds=[b"event",reserve.key().as_ref(),event.id.as_ref()],bump=event.bump)] pub event: Account<'info,ReliefEvent>,
    #[account(mut,has_one=event,seeds=[b"entitlement",event.key().as_ref(),entitlement.token.as_ref()],bump)] pub entitlement: Account<'info,Entitlement>,
    #[account(mut)] pub recipient: Signer<'info>,
}
#[account]
#[derive(InitSpace)]
pub struct Reserve {pub reviewer:Pubkey,pub primary:Pubkey,pub backup:Pubkey,pub verifier:Pubkey,pub outstanding:u64,pub bump:u8}
#[account]
#[derive(InitSpace)]
pub struct ReliefEvent {pub reserve:Pubkey,pub id:[u8;32],pub area:[u8;32],pub grant:u64,pub budget:u64,pub hold:u64,pub paid:u64,pub regular_allocated:u64,pub review_allocated:u64,pub bump:u8}
#[account]
#[derive(InitSpace)]
pub struct Entitlement {pub event:Pubkey,pub token:[u8;32],pub recipient:Pubkey,pub amount:u64,pub reviewed:bool,pub consumed:bool}
#[error_code]
pub enum Fault {
    #[msg("Role keys must be distinct")] Roles,
    #[msg("Both independent authorized signers are required")] Unauthorized,
    #[msg("Invalid event terms")] Terms,
    #[msg("Area commitment mismatch")] Area,
    #[msg("Checked arithmetic failed")] Arithmetic,
    #[msg("Allocation exceeds its approved cap")] Cap,
    #[msg("Insufficient uncommitted aid balance after rent")] Funds,
    #[msg("Entitlement already consumed")] Consumed,
    #[msg("Recipient differs from immutable entitlement")] Recipient,
}
#[cfg(test)]
mod tests{
    use super::*;
    #[test] fn fixed_grant_and_hold(){assert_eq!(allocate(30_000_000,10_000_000,40_000_000).unwrap(),40_000_000);assert!(allocate(40_000_000,10_000_000,40_000_000).is_err());assert!(allocate(10_000_000,10_000_000,10_000_000).is_err());}
    #[test] fn overflow_and_underflow(){assert!(add(u64::MAX,1).is_err());assert!(sub(0,1).is_err());assert!(allocate(u64::MAX,1,u64::MAX).is_err());}
    #[test] fn roles_cannot_collapse(){let a=Pubkey::new_unique();let b=Pubkey::new_unique();let c=Pubkey::new_unique();let r=Reserve{reviewer:a,primary:b,backup:c,verifier:a,outstanding:0,bump:0};assert!(authorize(&r,a,b).is_ok());assert!(authorize(&r,a,c).is_ok());assert!(authorize(&r,a,a).is_err());assert!(authorize(&r,b,c).is_err());}
}
