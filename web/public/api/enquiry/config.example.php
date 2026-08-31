<?php
/* ==========================================================================
   SMTP CREDENTIALS — COPY THIS FILE TO `config.php` AND FILL IT IN ON THE
   SERVER. `config.php` IS GIT-IGNORED AND MUST STAY THAT WAY.

   ⛔ DO NOT PUT THE PASSWORD IN THIS FILE, OR IN ANY OTHER FILE THAT IS
   COMMITTED. Two reasons, both real for this project:

     1. The repository is shared with an outside developer and the password
        would sit in its history for ever, readable long after it is changed.
     2. Everything under `public/` is also published to the Vercel copy of the
        site, where a `.php` file is served as PLAIN TEXT rather than executed.
        A committed `config.php` would be downloadable by anyone who guessed
        the URL. `index.php` is safe there only because it holds no secrets.

   The password is a Google Workspace app password, so anyone holding it can
   send mail as noreply@topcatworktops.co.uk. If it has ever been committed,
   revoke it at myaccount.google.com/apppasswords and issue a new one.
   ========================================================================== */

return [
  'host' => 'smtp.gmail.com',
  'port' => 465,
  'user' => 'noreply@topcatworktops.co.uk',
  'pass' => 'PUT-THE-APP-PASSWORD-HERE',

  /* Who the enquiry goes to, and who it comes from. */
  'to'        => 'info@topcatworktops.co.uk',
  'from'      => 'noreply@topcatworktops.co.uk',
  'from_name' => 'Topcat Worktops',
];
