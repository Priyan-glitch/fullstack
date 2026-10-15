/* ------------------------------------------------------------------ */
/* Login / landing page (index.html)                                   */
/* ------------------------------------------------------------------ */

function handleLoginWithAccountChooser() {
  window.location.href = "/oauth2/authorization/google?prompt=select_account";
}

/* Show the actual sign-in failure reason, then clear it from the URL so a
   refresh does not replay the message. */
const loginParams = new URLSearchParams(window.location.search);
const signInError = loginParams.get("error");
if (signInError) {
  const signInReasons = {
    access_denied: "Google denied access. If this OAuth app is still in testing mode, add your account as a test user, or pick a different account.",
    authorization_request_not_found: "The sign-in attempt expired or the server restarted mid-flow. Please try again.",
    invalid_email: "Google did not return an email address for that account.",
    invalid_client: "Google rejected the OAuth client credentials.",
    invalid_grant: "Google rejected the authorization code. Please try again.",
    redirect_uri_mismatch: "This redirect URI is not registered for the OAuth client.",
    domain: "Sign-in was rejected. Please try again.",
    oauth_failed: "Sign-in failed. Please try again."
  };
  alert("Sign-in failed: " + (signInReasons[signInError] || signInError));
  loginParams.delete("error");
  const remaining = loginParams.toString();
  window.history.replaceState({}, "", window.location.pathname + (remaining ? "?" + remaining : ""));
}
