-- ExerMind power-ups and answer authority.
--
-- The original exermind_exam schema was created outside migrations. The CTAS
-- definitions below intentionally inherit the deployed sessions.id and
-- questions.id types instead of assuming those identifiers are UUIDs.

create table if not exists exermind_exam.session_powerups as
select
  gen_random_uuid() as id,
  s.id as session_id,
  0::smallint as slot,
  ''::text as power_up_type,
  null::timestamptz as activated_at,
  null::timestamptz as resolved_at,
  q.id as activated_question_id,
  null::text as hint_snapshot,
  now()::timestamptz as created_at
from exermind_exam.sessions as s
cross join exermind_exam.questions as q
with no data;

alter table exermind_exam.session_powerups
  alter column id set default gen_random_uuid(),
  alter column id set not null,
  alter column session_id set not null,
  alter column slot set not null,
  alter column power_up_type set not null,
  alter column created_at set default now(),
  alter column created_at set not null;

alter table exermind_exam.session_powerups
  add constraint session_powerups_pkey primary key (id),
  add constraint session_powerups_session_slot_key unique (session_id, slot),
  add constraint session_powerups_slot_check check (slot between 1 and 3),
  add constraint session_powerups_type_check check (
    power_up_type in ('TIME_FREEZE', 'HINT', 'DOUBLE_POINTS')
  ),
  add constraint session_powerups_session_id_fkey
    foreign key (session_id)
    references exermind_exam.sessions (id)
    on delete cascade,
  add constraint session_powerups_question_id_fkey
    foreign key (activated_question_id)
    references exermind_exam.questions (id)
    on delete set null;

create table if not exists exermind_exam.session_answers as
select
  s.id as session_id,
  q.id as question_id,
  null::jsonb as answer,
  null::timestamptz as completed_at,
  null::boolean as is_correct,
  0::numeric as earned_points,
  0::numeric as total_points,
  0::numeric as game_points,
  1::integer as multiplier,
  now()::timestamptz as created_at,
  now()::timestamptz as updated_at
from exermind_exam.sessions as s
cross join exermind_exam.questions as q
with no data;

alter table exermind_exam.session_answers
  alter column session_id set not null,
  alter column question_id set not null,
  alter column earned_points set default 0,
  alter column earned_points set not null,
  alter column total_points set default 0,
  alter column total_points set not null,
  alter column game_points set default 0,
  alter column game_points set not null,
  alter column multiplier set default 1,
  alter column multiplier set not null,
  alter column created_at set default now(),
  alter column created_at set not null,
  alter column updated_at set default now(),
  alter column updated_at set not null;

alter table exermind_exam.session_answers
  add constraint session_answers_pkey primary key (session_id, question_id),
  add constraint session_answers_multiplier_check check (
    multiplier in (1, 2, 4, 8)
  ),
  add constraint session_answers_session_id_fkey
    foreign key (session_id)
    references exermind_exam.sessions (id)
    on delete cascade,
  add constraint session_answers_question_id_fkey
    foreign key (question_id)
    references exermind_exam.questions (id)
    on delete cascade;

alter table exermind_exam.sessions
  add column if not exists freeze_started_at timestamptz;

alter table exermind_exam.submissions
  add column if not exists earned_points numeric not null default 0,
  add column if not exists total_points numeric not null default 0,
  add column if not exists game_score numeric not null default 0;

create index if not exists session_powerups_session_idx
  on exermind_exam.session_powerups (session_id);

create index if not exists session_powerups_active_question_idx
  on exermind_exam.session_powerups (
    session_id,
    activated_question_id
  )
  where activated_at is not null;

create index if not exists session_answers_session_idx
  on exermind_exam.session_answers (session_id);

alter table exermind_exam.session_powerups enable row level security;
alter table exermind_exam.session_answers enable row level security;

revoke all on table exermind_exam.session_powerups
  from public, anon, authenticated;
revoke all on table exermind_exam.session_answers
  from public, anon, authenticated;

create or replace function exermind_exam._question_points(p_content jsonb)
returns numeric
language sql
immutable
set search_path = pg_catalog
as $$
  select case
    when nullif(btrim(p_content ->> 'points'), '') is not null
      and btrim(p_content ->> 'points') ~ '^[0-9]+([.][0-9]+)?$'
      and (p_content ->> 'points')::numeric > 0
      then (p_content ->> 'points')::numeric
    else 1::numeric
  end;
$$;

create or replace function exermind_exam._answer_text(p_answer jsonb)
returns text
language sql
immutable
set search_path = pg_catalog
as $$
  select case
    when p_answer is null or p_answer = 'null'::jsonb then null
    when jsonb_typeof(p_answer) = 'string' then p_answer #>> '{}'
    else p_answer::text
  end;
$$;

create or replace function exermind_exam._solution_text(p_solution jsonb)
returns text
language sql
immutable
set search_path = pg_catalog
as $$
  select case
    when p_solution is null or p_solution = 'null'::jsonb then null
    when jsonb_typeof(p_solution) = 'string' then p_solution #>> '{}'
    when jsonb_typeof(p_solution) = 'object' then coalesce(
      p_solution ->> 'correct_option_id',
      p_solution ->> 'correct_option',
      p_solution ->> 'correct_answer_id',
      p_solution ->> 'correct_answer',
      p_solution ->> 'answer_id',
      p_solution ->> 'answer',
      p_solution ->> 'key'
    )
    else null
  end;
$$;

create or replace function exermind_exam._normalize_answer_key(p_value text)
returns text
language sql
immutable
set search_path = pg_catalog
as $$
  select regexp_replace(lower(btrim(coalesce(p_value, ''))), '^opt[_-]', '');
$$;

create or replace function exermind_exam._is_correct_answer(
  p_answer jsonb,
  p_solution jsonb
)
returns boolean
language sql
immutable
set search_path = pg_catalog
as $$
  select
    exermind_exam._normalize_answer_key(
      exermind_exam._answer_text(p_answer)
    ) <> ''
    and exermind_exam._normalize_answer_key(
      exermind_exam._solution_text(p_solution)
    ) <> ''
    and exermind_exam._normalize_answer_key(
      exermind_exam._answer_text(p_answer)
    ) = exermind_exam._normalize_answer_key(
      exermind_exam._solution_text(p_solution)
    );
$$;

create or replace function exermind_exam._exam_state(p_session_id text)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, exermind_exam
as $$
declare
  v_session exermind_exam.sessions%rowtype;
  v_current_question_id text;
  v_questions jsonb;
  v_answers jsonb;
  v_power_ups jsonb;
  v_total_points numeric;
  v_earned_points numeric;
  v_game_score numeric;
  v_multiplier integer;
  v_remaining_seconds bigint;
begin
  select s.*
  into v_session
  from exermind_exam.sessions as s
  where s.id::text = p_session_id
  limit 1;

  if not found then
    return null;
  end if;

  select item.question_id
  into v_current_question_id
  from jsonb_array_elements_text(
    coalesce(to_jsonb(v_session.question_order), '[]'::jsonb)
  ) with ordinality as item(question_id, position)
  where not exists (
    select 1
    from exermind_exam.session_answers as answer
    where answer.session_id = v_session.id
      and answer.question_id::text = item.question_id
      and answer.completed_at is not null
  )
  order by item.position
  limit 1;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', question.id::text,
        'prompt', question.prompt,
        'content', coalesce(to_jsonb(question.content), '{}'::jsonb) - 'hint',
        'type', question.type
      )
      order by item.position
    ),
    '[]'::jsonb
  )
  into v_questions
  from jsonb_array_elements_text(
    coalesce(to_jsonb(v_session.question_order), '[]'::jsonb)
  ) with ordinality as item(question_id, position)
  join exermind_exam.questions as question
    on question.id::text = item.question_id;

  select coalesce(
    jsonb_object_agg(
      answer.question_id::text,
      jsonb_build_object(
        'answer', answer.answer,
        'completedAt', answer.completed_at,
        'isCorrect', answer.is_correct,
        'earnedPoints', answer.earned_points,
        'totalPoints', answer.total_points,
        'gamePoints', answer.game_points,
        'multiplier', answer.multiplier
      )
    ),
    '{}'::jsonb
  )
  into v_answers
  from exermind_exam.session_answers as answer
  where answer.session_id = v_session.id;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', power_up.id::text,
        'slot', power_up.slot,
        'type', power_up.power_up_type,
        'used', power_up.activated_at is not null,
        'activatedAt', power_up.activated_at,
        'questionId', power_up.activated_question_id::text,
        'hint', power_up.hint_snapshot
      )
      order by power_up.slot
    ),
    '[]'::jsonb
  )
  into v_power_ups
  from exermind_exam.session_powerups as power_up
  where power_up.session_id = v_session.id;

  select coalesce(
    sum(
      exermind_exam._question_points(
        coalesce(to_jsonb(question.content), '{}'::jsonb)
      )
    ),
    0
  )
  into v_total_points
  from jsonb_array_elements_text(
    coalesce(to_jsonb(v_session.question_order), '[]'::jsonb)
  ) as item(question_id)
  join exermind_exam.questions as question
    on question.id::text = item.question_id;

  select
    coalesce(sum(answer.earned_points), 0),
    coalesce(sum(answer.game_points), 0)
  into v_earned_points, v_game_score
  from exermind_exam.session_answers as answer
  where answer.session_id = v_session.id;

  select (2 ^ count(*))::integer
  into v_multiplier
  from exermind_exam.session_powerups as power_up
  where power_up.session_id = v_session.id
    and power_up.power_up_type = 'DOUBLE_POINTS'
    and power_up.activated_at is not null
    and power_up.activated_question_id::text = v_current_question_id;

  v_multiplier := coalesce(v_multiplier, 1);
  v_remaining_seconds := greatest(
    0,
    floor(
      extract(
        epoch from (
          v_session.expires_at
          - coalesce(v_session.freeze_started_at, clock_timestamp())
        )
      )
    )::bigint
  );

  return jsonb_build_object(
    'session', jsonb_build_object(
      'id', v_session.id::text,
      'teamId', v_session.team_id::text,
      'status', v_session.status,
      'startedAt', v_session.started_at,
      'expiresAt', v_session.expires_at,
      'submittedAt', v_session.submitted_at,
      'isTimeFrozen', v_session.freeze_started_at is not null,
      'freezeStartedAt', v_session.freeze_started_at,
      'remainingSeconds', v_remaining_seconds
    ),
    'questions', v_questions,
    'answers', v_answers,
    'powerUps', v_power_ups,
    'currentQuestionId', v_current_question_id,
    'score', jsonb_build_object(
      'earnedPoints', v_earned_points,
      'totalPoints', v_total_points,
      'gameScore', v_game_score,
      'multiplier', v_multiplier
    )
  );
end;
$$;

create or replace function exermind_exam.start_session(p_power_ups text[])
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, exermind_exam
as $$
declare
  v_user_id uuid;
  v_team public.teams%rowtype;
  v_session exermind_exam.sessions%rowtype;
  v_question_order jsonb;
  v_existing_power_up_count integer;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception using
      errcode = 'P0001',
      message = 'EXERMIND_UNAUTHENTICATED: Sign in before starting an exam.';
  end if;

  if coalesce(array_length(p_power_ups, 1), 0) <> 3 then
    raise exception using
      errcode = 'P0001',
      message = 'EXERMIND_INVALID_POWER_UPS: Exactly three power-ups are required.';
  end if;

  if exists (
    select 1
    from unnest(p_power_ups) as selected(power_up_type)
    where selected.power_up_type is null
      or selected.power_up_type not in (
        'TIME_FREEZE',
        'HINT',
        'DOUBLE_POINTS'
      )
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'EXERMIND_INVALID_POWER_UPS: Unsupported power-up type.';
  end if;

  -- Serializes concurrent starts for the same authenticated user, including the
  -- case where the team currently has no session row to lock.
  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text, 0));

  select team.*
  into v_team
  from public.teams as team
  where team.leader_user_id = v_user_id
  limit 1
  for update of team;

  if not found then
    raise exception using
      errcode = 'P0001',
      message = 'EXERMIND_TEAM_NOT_FOUND: No owned team is available.';
  end if;

  select session.*
  into v_session
  from exermind_exam.sessions as session
  where session.team_id = v_team.id
  limit 1
  for update of session;

  if found then
    select count(*)
    into v_existing_power_up_count
    from exermind_exam.session_powerups as power_up
    where power_up.session_id = v_session.id;

    if v_existing_power_up_count = 0
      and v_session.status::text = 'IN_PROGRESS'
    then
      insert into exermind_exam.session_powerups (
        session_id,
        slot,
        power_up_type
      )
      select
        v_session.id,
        selected.ordinality::smallint,
        selected.power_up_type
      from unnest(p_power_ups)
        with ordinality as selected(power_up_type, ordinality);
    elsif v_existing_power_up_count <> 3 then
      raise exception using
        errcode = 'P0001',
        message = 'EXERMIND_INVALID_INVENTORY: Session inventory must contain exactly three power-ups.';
    end if;

    return exermind_exam._exam_state(v_session.id::text);
  end if;

  select jsonb_agg(to_jsonb(pool.id) order by pool.random_order)
  into v_question_order
  from (
    select question.id, random() as random_order
    from exermind_exam.questions as question
    where trim(both '"' from upper(trim(coalesce(question.round::text, '')))) = 'PRELIMINARY'
    order by random_order
    limit 60
  ) as pool;

  -- Preserve the prior behavior for databases whose question type labels do
  -- not match the configured mode.
  if coalesce(jsonb_array_length(v_question_order), 0) = 0 then
    select jsonb_agg(to_jsonb(pool.id) order by pool.random_order)
    into v_question_order
    from (
      select question.id, random() as random_order
      from exermind_exam.questions as question
      order by random_order
      limit 60
    ) as pool;
  end if;

  if coalesce(jsonb_array_length(v_question_order), 0) = 0 then
    raise exception using
      errcode = 'P0001',
      message = 'EXERMIND_NO_QUESTIONS: No questions are available.';
  end if;

  insert into exermind_exam.sessions (
    team_id,
    competition_id,
    status,
    started_at,
    expires_at,
    question_order
  )
  values (
    v_team.id,
    v_team.competition_id,
    'IN_PROGRESS',
    clock_timestamp(),
    clock_timestamp() + make_interval(mins => 60),
    (
      jsonb_populate_record(
        null::exermind_exam.sessions,
        jsonb_build_object('question_order', v_question_order)
      )
    ).question_order
  )
  returning * into v_session;

  insert into exermind_exam.session_powerups (
    session_id,
    slot,
    power_up_type
  )
  select
    v_session.id,
    selected.ordinality::smallint,
    selected.power_up_type
  from unnest(p_power_ups)
    with ordinality as selected(power_up_type, ordinality);

  return exermind_exam._exam_state(v_session.id::text);
end;
$$;

create or replace function exermind_exam.submit_exam(
  p_warning_count integer default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, exermind_exam
as $$
declare
  v_user_id uuid;
  v_session exermind_exam.sessions%rowtype;
  v_submission exermind_exam.submissions%rowtype;
  v_answer exermind_exam.session_answers%rowtype;
  v_question exermind_exam.questions%rowtype;
  v_answers jsonb;
  v_points numeric;
  v_double_points_count integer;
  v_multiplier integer;
  v_is_correct boolean;
  v_earned_points numeric;
  v_total_points numeric;
  v_game_score numeric;
  v_final_score numeric;
  v_correct_count integer;
  v_total_questions integer;
  v_has_essay boolean;
  v_submitted_at timestamptz;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception using
      errcode = 'P0001',
      message = 'EXERMIND_UNAUTHENTICATED: Sign in to submit an exam.';
  end if;

  select session.*
  into v_session
  from exermind_exam.sessions as session
  join public.teams as team
    on team.id = session.team_id
  where team.leader_user_id = v_user_id
  order by session.started_at desc nulls last
  limit 1
  for update of session;

  if not found then
    raise exception using
      errcode = 'P0001',
      message = 'EXERMIND_SESSION_NOT_FOUND: No owned exam session exists.';
  end if;

  select submission.*
  into v_submission
  from exermind_exam.submissions as submission
  where submission.session_id = v_session.id
  limit 1
  for update;

  if v_session.status::text in ('SUBMITTED', 'COMPLETED') and found then
    select
      count(*) filter (where answer.is_correct),
      count(*)
    into v_correct_count, v_total_questions
    from exermind_exam.session_answers as answer
    where answer.session_id = v_session.id;

    return jsonb_build_object(
      'state', exermind_exam._exam_state(v_session.id::text),
      'result', jsonb_build_object(
        'score', v_submission.score,
        'maxScore', v_submission.max_score,
        'earnedPoints', v_submission.earned_points,
        'totalPoints', v_submission.total_points,
        'gameScore', v_submission.game_score,
        'correctCount', coalesce(v_correct_count, 0),
        'totalQuestions', coalesce(v_total_questions, 0)
      )
    );
  end if;

  if v_session.status::text <> 'IN_PROGRESS' then
    raise exception using
      errcode = 'P0001',
      message = 'EXERMIND_SESSION_CLOSED: This session cannot be submitted.';
  end if;

  if v_session.freeze_started_at is not null then
    -- Submission, including an anti-cheat forced submission, terminates a
    -- freeze without extending the exam deadline.
    update exermind_exam.session_powerups
    set resolved_at = coalesce(resolved_at, clock_timestamp())
    where session_id = v_session.id
      and power_up_type = 'TIME_FREEZE'
      and activated_at is not null
      and resolved_at is null;

    update exermind_exam.sessions
    set freeze_started_at = null
    where id = v_session.id;

    v_session.freeze_started_at := null;
  end if;

  for v_question in
    select question.*
    from jsonb_array_elements_text(
      coalesce(to_jsonb(v_session.question_order), '[]'::jsonb)
    ) with ordinality as item(question_id, position)
    join exermind_exam.questions as question
      on question.id::text = item.question_id
    order by item.position
  loop
    select answer.*
    into v_answer
    from exermind_exam.session_answers as answer
    where answer.session_id = v_session.id
      and answer.question_id = v_question.id
    for update;

    if not found then
      insert into exermind_exam.session_answers (
        session_id,
        question_id,
        answer
      )
      values (
        v_session.id,
        v_question.id,
        null
      )
      returning * into v_answer;
    end if;

    if v_answer.completed_at is null then
      v_points := exermind_exam._question_points(
        coalesce(to_jsonb(v_question.content), '{}'::jsonb)
      );

      select count(*)
      into v_double_points_count
      from exermind_exam.session_powerups as double_points
      where double_points.session_id = v_session.id
        and double_points.power_up_type = 'DOUBLE_POINTS'
        and double_points.activated_at is not null
        and double_points.activated_question_id = v_question.id;

      v_multiplier := (2 ^ v_double_points_count)::integer;

      if upper(v_question.type::text) = 'ESSAY' then
        v_is_correct := null;
      else
        v_is_correct := exermind_exam._is_correct_answer(
          v_answer.answer,
          to_jsonb(v_question.solution)
        );
      end if;

      update exermind_exam.session_answers
      set
        completed_at = clock_timestamp(),
        is_correct = v_is_correct,
        earned_points = case when v_is_correct then v_points else 0 end,
        total_points = v_points,
        game_points = case
          when v_is_correct then v_points * v_multiplier
          else 0
        end,
        multiplier = v_multiplier,
        updated_at = clock_timestamp()
      where session_id = v_session.id
        and question_id = v_question.id;
    end if;

    update exermind_exam.session_powerups
    set resolved_at = coalesce(resolved_at, clock_timestamp())
    where session_id = v_session.id
      and activated_question_id = v_question.id
      and activated_at is not null
      and resolved_at is null;
  end loop;

  select
    coalesce(sum(answer.earned_points), 0),
    coalesce(sum(answer.total_points), 0),
    coalesce(sum(answer.game_points), 0),
    count(*) filter (where answer.is_correct),
    count(*)
  into
    v_earned_points,
    v_total_points,
    v_game_score,
    v_correct_count,
    v_total_questions
  from exermind_exam.session_answers as answer
  where answer.session_id = v_session.id;

  select coalesce(
    bool_or(upper(question.type::text) = 'ESSAY'),
    false
  )
  into v_has_essay
  from jsonb_array_elements_text(
    coalesce(to_jsonb(v_session.question_order), '[]'::jsonb)
  ) as item(question_id)
  join exermind_exam.questions as question
    on question.id::text = item.question_id;

  select coalesce(
    jsonb_object_agg(answer.question_id::text, answer.answer),
    '{}'::jsonb
  )
  into v_answers
  from exermind_exam.session_answers as answer
  where answer.session_id = v_session.id
    and answer.answer is not null
    and answer.answer <> 'null'::jsonb;

  v_final_score := case
    when v_has_essay then null
    when v_total_points > 0
      then round((v_earned_points / v_total_points) * 100, 2)
    else 0
  end;
  v_submitted_at := clock_timestamp();

  if v_submission.session_id is null then
    insert into exermind_exam.submissions (
      session_id,
      answers,
      score,
      max_score,
      is_graded,
      submission_type,
      submitted_at,
      earned_points,
      total_points,
      game_score
    )
    values (
      v_session.id,
      v_answers,
      v_final_score,
      100,
      not v_has_essay,
      case when v_has_essay then 'ESSAY' else 'AUTO' end,
      v_submitted_at,
      v_earned_points,
      v_total_points,
      v_game_score
    )
    returning * into v_submission;
  else
    update exermind_exam.submissions
    set
      answers = v_answers,
      score = v_final_score,
      max_score = 100,
      is_graded = not v_has_essay,
      submission_type = case when v_has_essay then 'ESSAY' else 'AUTO' end,
      submitted_at = v_submitted_at,
      earned_points = v_earned_points,
      total_points = v_total_points,
      game_score = v_game_score
    where session_id = v_session.id
    returning * into v_submission;
  end if;

  update exermind_exam.sessions
  set
    status = 'SUBMITTED',
    submitted_at = v_submitted_at,
    warning_count = greatest(
      coalesce(warning_count, 0),
      coalesce(p_warning_count, 0)
    )
  where id = v_session.id;

  return jsonb_build_object(
    'state', exermind_exam._exam_state(v_session.id::text),
    'result', jsonb_build_object(
      'score', v_final_score,
      'maxScore', 100,
      'earnedPoints', v_earned_points,
      'totalPoints', v_total_points,
      'gameScore', v_game_score,
      'correctCount', v_correct_count,
      'totalQuestions', v_total_questions
    )
  );
end;
$$;

create or replace function exermind_exam.get_exam_state()
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, exermind_exam
as $$
declare
  v_user_id uuid;
  v_session_id text;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception using
      errcode = 'P0001',
      message = 'EXERMIND_UNAUTHENTICATED: Sign in to view an exam.';
  end if;

  select session.id::text
  into v_session_id
  from exermind_exam.sessions as session
  join public.teams as team
    on team.id = session.team_id
  where team.leader_user_id = v_user_id
  order by session.started_at desc nulls last
  limit 1;

  if not found then
    return null;
  end if;

  return exermind_exam._exam_state(v_session_id);
end;
$$;

create or replace function exermind_exam.activate_power_up(
  p_power_up_id text,
  p_question_id text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, exermind_exam
as $$
declare
  v_user_id uuid;
  v_session exermind_exam.sessions%rowtype;
  v_power_up exermind_exam.session_powerups%rowtype;
  v_hint text;
  v_active_freeze_question_id text;
  v_current_question_id text;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception using
      errcode = 'P0001',
      message = 'EXERMIND_UNAUTHENTICATED: Sign in to use a power-up.';
  end if;

  select session.*
  into v_session
  from exermind_exam.sessions as session
  join public.teams as team
    on team.id = session.team_id
  where team.leader_user_id = v_user_id
  order by session.started_at desc nulls last
  limit 1
  for update of session;

  if not found then
    raise exception using
      errcode = 'P0001',
      message = 'EXERMIND_SESSION_NOT_FOUND: No owned exam session exists.';
  end if;

  select power_up.*
  into v_power_up
  from exermind_exam.session_powerups as power_up
  where power_up.id::text = p_power_up_id
    and power_up.session_id = v_session.id
  for update;

  if not found then
    raise exception using
      errcode = 'P0001',
      message = 'EXERMIND_POWER_UP_NOT_FOUND: Power-up does not belong to this session.';
  end if;

  -- A repeated delivery of the same activation is an idempotent success.
  if v_power_up.activated_at is not null then
    if v_power_up.activated_question_id::text = p_question_id then
      return exermind_exam._exam_state(v_session.id::text);
    end if;

    raise exception using
      errcode = 'P0001',
      message = 'EXERMIND_POWER_UP_USED: Power-up was already used on another question.';
  end if;

  if v_session.status::text <> 'IN_PROGRESS' then
    raise exception using
      errcode = 'P0001',
      message = 'EXERMIND_SESSION_CLOSED: Power-ups require an active session.';
  end if;

  if v_session.freeze_started_at is null
    and v_session.expires_at <= clock_timestamp()
  then
    raise exception using
      errcode = 'P0001',
      message = 'EXERMIND_SESSION_EXPIRED: The exam time has elapsed.';
  end if;

  if not exists (
    select 1
    from jsonb_array_elements_text(
      coalesce(to_jsonb(v_session.question_order), '[]'::jsonb)
    ) as item(question_id)
    where item.question_id = p_question_id
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'EXERMIND_QUESTION_NOT_FOUND: Question is not part of this session.';
  end if;

  if exists (
    select 1
    from exermind_exam.session_answers as answer
    where answer.session_id = v_session.id
      and answer.question_id::text = p_question_id
      and answer.completed_at is not null
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'EXERMIND_QUESTION_COMPLETED: Completed questions cannot receive power-ups.';
  end if;

  select item.question_id
  into v_current_question_id
  from jsonb_array_elements_text(
    coalesce(to_jsonb(v_session.question_order), '[]'::jsonb)
  ) with ordinality as item(question_id, position)
  where not exists (
    select 1
    from exermind_exam.session_answers as answer
    where answer.session_id = v_session.id
      and answer.question_id::text = item.question_id
      and answer.completed_at is not null
  )
  order by item.position
  limit 1;

  if v_current_question_id is distinct from p_question_id then
    raise exception using
      errcode = 'P0001',
      message = 'EXERMIND_QUESTION_NOT_CURRENT: Power-ups apply only to the current question.';
  end if;

  select active_freeze.activated_question_id::text
  into v_active_freeze_question_id
  from exermind_exam.session_powerups as active_freeze
  where active_freeze.session_id = v_session.id
    and active_freeze.power_up_type = 'TIME_FREEZE'
    and active_freeze.activated_at is not null
    and active_freeze.resolved_at is null
  order by active_freeze.activated_at
  limit 1;

  if v_active_freeze_question_id is not null
    and v_active_freeze_question_id <> p_question_id
  then
    raise exception using
      errcode = 'P0001',
      message = 'EXERMIND_FREEZE_ACTIVE: Complete the frozen question first.';
  end if;

  if v_active_freeze_question_id is not null
    and v_power_up.power_up_type = 'TIME_FREEZE'
  then
    raise exception using
      errcode = 'P0001',
      message = 'EXERMIND_FREEZE_DUPLICATE: Time is already frozen for this question.';
  end if;

  if v_power_up.power_up_type = 'HINT' then
    select nullif(btrim(to_jsonb(question.content) ->> 'hint'), '')
    into v_hint
    from exermind_exam.questions as question
    where question.id::text = p_question_id;

    if v_hint is null then
      raise exception using
        errcode = 'P0001',
        message = 'EXERMIND_HINT_MISSING: This question has no hint.';
    end if;

    if exists (
      select 1
      from exermind_exam.session_powerups as used_hint
      where used_hint.session_id = v_session.id
        and used_hint.power_up_type = 'HINT'
        and used_hint.activated_at is not null
        and used_hint.activated_question_id::text = p_question_id
    ) then
      raise exception using
        errcode = 'P0001',
        message = 'EXERMIND_HINT_DUPLICATE: A hint was already used on this question.';
    end if;

    update exermind_exam.session_powerups
    set
      activated_at = clock_timestamp(),
      activated_question_id = (
        select question.id
        from exermind_exam.questions as question
        where question.id::text = p_question_id
      ),
      hint_snapshot = v_hint
    where id = v_power_up.id;
  else
    update exermind_exam.session_powerups
    set
      activated_at = clock_timestamp(),
      activated_question_id = (
        select question.id
        from exermind_exam.questions as question
        where question.id::text = p_question_id
      )
    where id = v_power_up.id;

    if v_power_up.power_up_type = 'TIME_FREEZE'
      and v_session.freeze_started_at is null
    then
      update exermind_exam.sessions
      set freeze_started_at = clock_timestamp()
      where id = v_session.id;
    end if;
  end if;

  return exermind_exam._exam_state(v_session.id::text);
end;
$$;

create or replace function exermind_exam.save_answer(
  p_question_id text,
  p_answer jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, exermind_exam
as $$
declare
  v_user_id uuid;
  v_session exermind_exam.sessions%rowtype;
  v_answer exermind_exam.session_answers%rowtype;
  v_question_id exermind_exam.questions.id%type;
  v_current_question_id text;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception using
      errcode = 'P0001',
      message = 'EXERMIND_UNAUTHENTICATED: Sign in to save an answer.';
  end if;

  select session.*
  into v_session
  from exermind_exam.sessions as session
  join public.teams as team
    on team.id = session.team_id
  where team.leader_user_id = v_user_id
  order by session.started_at desc nulls last
  limit 1
  for update of session;

  if not found then
    raise exception using
      errcode = 'P0001',
      message = 'EXERMIND_SESSION_NOT_FOUND: No owned exam session exists.';
  end if;

  select question.id
  into v_question_id
  from exermind_exam.questions as question
  where question.id::text = p_question_id
    and exists (
      select 1
      from jsonb_array_elements_text(
        coalesce(to_jsonb(v_session.question_order), '[]'::jsonb)
      ) as item(question_id)
      where item.question_id = question.id::text
    );

  if not found then
    raise exception using
      errcode = 'P0001',
      message = 'EXERMIND_QUESTION_NOT_FOUND: Question is not part of this session.';
  end if;

  select answer.*
  into v_answer
  from exermind_exam.session_answers as answer
  where answer.session_id = v_session.id
    and answer.question_id = v_question_id
  for update;

  if found and v_answer.completed_at is not null then
    if v_answer.answer is not distinct from p_answer then
      return exermind_exam._exam_state(v_session.id::text);
    end if;

    raise exception using
      errcode = 'P0001',
      message = 'EXERMIND_QUESTION_COMPLETED: A completed answer cannot be changed.';
  end if;

  if v_session.status::text <> 'IN_PROGRESS' then
    raise exception using
      errcode = 'P0001',
      message = 'EXERMIND_SESSION_CLOSED: Answers require an active session.';
  end if;

  if v_session.freeze_started_at is null
    and v_session.expires_at <= clock_timestamp()
  then
    raise exception using
      errcode = 'P0001',
      message = 'EXERMIND_SESSION_EXPIRED: The exam time has elapsed.';
  end if;

  select item.question_id
  into v_current_question_id
  from jsonb_array_elements_text(
    coalesce(to_jsonb(v_session.question_order), '[]'::jsonb)
  ) with ordinality as item(question_id, position)
  where not exists (
    select 1
    from exermind_exam.session_answers as completed_answer
    where completed_answer.session_id = v_session.id
      and completed_answer.question_id::text = item.question_id
      and completed_answer.completed_at is not null
  )
  order by item.position
  limit 1;

  if v_current_question_id is distinct from p_question_id then
    raise exception using
      errcode = 'P0001',
      message = 'EXERMIND_QUESTION_NOT_CURRENT: Only the current answer can be saved.';
  end if;

  insert into exermind_exam.session_answers (
    session_id,
    question_id,
    answer,
    updated_at
  )
  values (
    v_session.id,
    v_question_id,
    p_answer,
    clock_timestamp()
  )
  on conflict (session_id, question_id)
  do update set
    answer = excluded.answer,
    updated_at = excluded.updated_at
  where exermind_exam.session_answers.completed_at is null;

  return exermind_exam._exam_state(v_session.id::text);
end;
$$;

create or replace function exermind_exam.complete_question(p_question_id text)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, exermind_exam
as $$
declare
  v_user_id uuid;
  v_session exermind_exam.sessions%rowtype;
  v_answer exermind_exam.session_answers%rowtype;
  v_question exermind_exam.questions%rowtype;
  v_current_question_id text;
  v_active_freeze_count integer;
  v_double_points_count integer;
  v_points numeric;
  v_multiplier integer;
  v_is_correct boolean;
  v_completed_at timestamptz;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception using
      errcode = 'P0001',
      message = 'EXERMIND_UNAUTHENTICATED: Sign in to complete a question.';
  end if;

  select session.*
  into v_session
  from exermind_exam.sessions as session
  join public.teams as team
    on team.id = session.team_id
  where team.leader_user_id = v_user_id
  order by session.started_at desc nulls last
  limit 1
  for update of session;

  if not found then
    raise exception using
      errcode = 'P0001',
      message = 'EXERMIND_SESSION_NOT_FOUND: No owned exam session exists.';
  end if;

  select question.*
  into v_question
  from exermind_exam.questions as question
  where question.id::text = p_question_id
    and exists (
      select 1
      from jsonb_array_elements_text(
        coalesce(to_jsonb(v_session.question_order), '[]'::jsonb)
      ) as item(question_id)
      where item.question_id = question.id::text
    );

  if not found then
    raise exception using
      errcode = 'P0001',
      message = 'EXERMIND_QUESTION_NOT_FOUND: Question is not part of this session.';
  end if;

  select answer.*
  into v_answer
  from exermind_exam.session_answers as answer
  where answer.session_id = v_session.id
    and answer.question_id = v_question.id
  for update;

  if found and v_answer.completed_at is not null then
    return exermind_exam._exam_state(v_session.id::text);
  end if;

  if not found then
    raise exception using
      errcode = 'P0001',
      message = 'EXERMIND_ANSWER_NOT_SAVED: Save an answer before completing the question.';
  end if;

  if v_session.status::text <> 'IN_PROGRESS' then
    raise exception using
      errcode = 'P0001',
      message = 'EXERMIND_SESSION_CLOSED: Question completion requires an active session.';
  end if;

  select item.question_id
  into v_current_question_id
  from jsonb_array_elements_text(
    coalesce(to_jsonb(v_session.question_order), '[]'::jsonb)
  ) with ordinality as item(question_id, position)
  where not exists (
    select 1
    from exermind_exam.session_answers as completed_answer
    where completed_answer.session_id = v_session.id
      and completed_answer.question_id::text = item.question_id
      and completed_answer.completed_at is not null
  )
  order by item.position
  limit 1;

  if v_current_question_id is distinct from p_question_id then
    raise exception using
      errcode = 'P0001',
      message = 'EXERMIND_QUESTION_NOT_CURRENT: Questions must be completed in order.';
  end if;

  select count(*)
  into v_active_freeze_count
  from exermind_exam.session_powerups as active_freeze
  where active_freeze.session_id = v_session.id
    and active_freeze.power_up_type = 'TIME_FREEZE'
    and active_freeze.activated_at is not null
    and active_freeze.resolved_at is null
    and active_freeze.activated_question_id = v_question.id;

  if v_active_freeze_count > 0
    and nullif(
      btrim(exermind_exam._answer_text(v_answer.answer)),
      ''
    ) is null
  then
    raise exception using
      errcode = 'P0001',
      message = 'EXERMIND_ANSWER_REQUIRED: A non-empty answer is required to end a time freeze.';
  end if;

  if v_active_freeze_count = 0
    and v_session.expires_at <= clock_timestamp()
  then
    raise exception using
      errcode = 'P0001',
      message = 'EXERMIND_SESSION_EXPIRED: The exam time has elapsed.';
  end if;

  v_points := exermind_exam._question_points(
    coalesce(to_jsonb(v_question.content), '{}'::jsonb)
  );

  select count(*)
  into v_double_points_count
  from exermind_exam.session_powerups as double_points
  where double_points.session_id = v_session.id
    and double_points.power_up_type = 'DOUBLE_POINTS'
    and double_points.activated_at is not null
    and double_points.activated_question_id = v_question.id;

  v_multiplier := (2 ^ v_double_points_count)::integer;
  v_completed_at := clock_timestamp();

  if upper(v_question.type::text) = 'ESSAY' then
    v_is_correct := null;
  else
    v_is_correct := exermind_exam._is_correct_answer(
      v_answer.answer,
      to_jsonb(v_question.solution)
    );
  end if;

  update exermind_exam.session_answers
  set
    completed_at = v_completed_at,
    is_correct = v_is_correct,
    earned_points = case when v_is_correct then v_points else 0 end,
    total_points = v_points,
    game_points = case
      when v_is_correct then v_points * v_multiplier
      else 0
    end,
    multiplier = v_multiplier,
    updated_at = v_completed_at
  where session_id = v_session.id
    and question_id = v_question.id;

  update exermind_exam.session_powerups
  set resolved_at = v_completed_at
  where session_id = v_session.id
    and activated_question_id = v_question.id
    and activated_at is not null
    and resolved_at is null;

  if v_active_freeze_count > 0 then
    update exermind_exam.sessions
    set
      expires_at = expires_at + (v_completed_at - freeze_started_at),
      freeze_started_at = null
    where id = v_session.id;
  end if;

  return exermind_exam._exam_state(v_session.id::text);
end;
$$;

revoke all on function exermind_exam._question_points(jsonb)
  from public, anon, authenticated;
revoke all on function exermind_exam._answer_text(jsonb)
  from public, anon, authenticated;
revoke all on function exermind_exam._solution_text(jsonb)
  from public, anon, authenticated;
revoke all on function exermind_exam._normalize_answer_key(text)
  from public, anon, authenticated;
revoke all on function exermind_exam._is_correct_answer(jsonb, jsonb)
  from public, anon, authenticated;
revoke all on function exermind_exam._exam_state(text)
  from public, anon, authenticated;

revoke all on function exermind_exam.start_session(text[])
  from public, anon;
revoke all on function exermind_exam.get_exam_state()
  from public, anon;
revoke all on function exermind_exam.activate_power_up(text, text)
  from public, anon;
revoke all on function exermind_exam.save_answer(text, jsonb)
  from public, anon;
revoke all on function exermind_exam.complete_question(text)
  from public, anon;
revoke all on function exermind_exam.submit_exam(integer)
  from public, anon;

grant usage on schema exermind_exam to authenticated;
grant execute on function exermind_exam.start_session(text[])
  to authenticated;
grant execute on function exermind_exam.get_exam_state()
  to authenticated;
grant execute on function exermind_exam.activate_power_up(text, text)
  to authenticated;
grant execute on function exermind_exam.save_answer(text, jsonb)
  to authenticated;
grant execute on function exermind_exam.complete_question(text)
  to authenticated;
grant execute on function exermind_exam.submit_exam(integer)
  to authenticated;
