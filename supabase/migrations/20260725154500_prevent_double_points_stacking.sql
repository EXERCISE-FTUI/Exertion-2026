-- A selected Double Points slot remains single-use, but only one unresolved
-- slot may be activated for a given question. Refund extra unresolved slots
-- created during pre-release testing before enforcing the invariant.

with ranked_double_points as (
  select
    power_up.id,
    row_number() over (
      partition by power_up.session_id, power_up.activated_question_id
      order by power_up.activated_at, power_up.slot, power_up.id
    ) as activation_rank
  from exermind_exam.session_powerups as power_up
  where power_up.power_up_type = 'DOUBLE_POINTS'
    and power_up.activated_at is not null
    and power_up.resolved_at is null
)
update exermind_exam.session_powerups as power_up
set
  activated_at = null,
  activated_question_id = null,
  resolved_at = null
from ranked_double_points as ranked
where ranked.id = power_up.id
  and ranked.activation_rank > 1;

create unique index if not exists
  session_powerups_one_active_double_points_per_question_idx
on exermind_exam.session_powerups (session_id, activated_question_id)
where power_up_type = 'DOUBLE_POINTS'
  and activated_at is not null
  and resolved_at is null;
