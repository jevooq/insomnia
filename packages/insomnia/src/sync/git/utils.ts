import { AuthCallback, AuthFailureCallback, AuthSuccessCallback, GitAuth, MessageCallback } from 'isomorphic-git';

import type { GitCredentials } from './git-vcs';

export const translateSSHtoHTTP = (url: string) => {
  // handle "shorter scp-like syntax"
  url = url.replace(/^git@([^:]+):/, 'https://$1/');
  // handle proper SSH URLs
  url = url.replace(/^ssh:\/\//, 'https://');
  return url;
};

export const addDotGit = (url: string): string => (url.endsWith('.git') ? url : `${url}.git`);

const onMessage: MessageCallback = message => {
  console.log(`[git-event] ${message}`);
};

const onAuthFailure: AuthFailureCallback = async message => {
  console.log(`[git-event] Auth Failure: ${message}`);
};

const onAuthSuccess: AuthSuccessCallback = message => {
  console.log(`[git-event] Auth Success: ${message}`);
};

const onAuth = (credentials?: GitCredentials): AuthCallback => (): GitAuth => {
  if (!credentials) {
    console.log('[git-event] No credentials');
    return {
      username: '',
      password: '',
    };
  }

  if ('oauth2format' in credentials && credentials.oauth2format === 'github') {
    console.log('[git-event] Using OAuth2 credentials');
    return {
      username: credentials.token,
      password: 'x-oauth-basic',
    };
  }

  console.log('[git-event] Using basic auth credentials');
  return {
    username: credentials.username,
    // @ts-expect-error -- TSCONVERSION this needs to be handled better if credentials is undefined or which union type
    password: credentials.password || credentials.token,
  };
};

export const gitCallbacks = (credentials?: GitCredentials | null) => ({
  onMessage,
  onAuthFailure,
  onAuthSuccess,
  onAuth: onAuth(credentials ?? undefined),
});
