create extension if not exists pg_cron schema extensions;
create extension if not exists http schema extensions;

select
  cron.schedule(
    'send-digest', -- name of the cron job
    '*/15 * * * *', -- every minute
    $$
    select status
    from
      http_post(
        'https://cron.famdigest.com/digests', -- webhook URL, replace the ID(223c8..) with your own
        '{}', -- payload
        'application/json'
      )
    $$
  );

select
  cron.schedule(
    'opt-in-reminder', -- name of the cron job
    '0 13 * * *', -- at 1pm every day
    $$
    select status
    from
      http_post(
        'https://cron.famdigest.com/opt-in-reminder', -- webhook URL, replace the ID(223c8..) with your own
        '{}', -- payload
        'application/json'
      )
    $$
  );
