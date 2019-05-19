import React, { useState, useEffect } from 'react';
import { useShared } from '../..';

class Auth {
  constructor() {
    this.user = null;
    this.listeners = [];
  }

  initSignInStatus() {
    return new Promise(resolve => {
      const storedUser = sessionStorage.getItem('auth-example-user');
      if (storedUser != null) {
        this.user = JSON.parse(storedUser);
        this.notifyListeners();
      }
      resolve();
    });
  }

  storeUser(user) {
    sessionStorage.setItem('auth-example-user', JSON.stringify(user));
  }

  subscribeSignInStatus(listener) {
    console.log('subscribe sign-in status');
    this.listeners.push(listener);
    this.notifyListeners();
    return () => {
      console.log('unsubscribe sign-in status');
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    this.listeners.forEach(l => l(this.user));
  }

  signIn() {
    return new Promise(resolve => {
      setTimeout(() => {
        this.user = { name: 'Ryu' };
        this.storeUser(this.user);
        resolve(this.user);
        this.notifyListeners();
      }, 200);
    });
  }

  signOut() {
    return new Promise(resolve => {
      setTimeout(() => {
        this.user = null;
        this.storeUser(null);
        resolve(this.user);
        this.notifyListeners();
      }, 200);
    });
  }
}

const auth = new Auth();

const spaceId = Symbol();

const useAuth = () => {
  const shared = useShared(spaceId);
  const [user, setUser] = shared.useState(null);

  shared.useEffect(() => {
    auth.initSignInStatus();
    return auth.subscribeSignInStatus(setUser);
  }, []);

  return {
    user,
    signIn: () => auth.signIn(),
    signOut: () => auth.signOut(),
  };
};

const UserStatus = () => {
  const { user } = useAuth();
  return user ? <div>Signed in as user.name</div> : <div>Please sign in</div>;
};

const Main = () => {
  const { user, signIn, signOut } = useAuth();
  return user ? (
    <div>
      <h2>Welcome back, {user.name}!</h2>
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  ) : (
    <div>
      <h2>Welcome!</h2>
      <button onClick={() => signIn()}>Sign in</button>
    </div>
  );
};

export const AuthExample = () => {
  return (
    <div>
      <header>
        <h1>Auth Example</h1>
        <UserStatus />
      </header>
      <main>
        <Main />
      </main>
    </div>
  );
};
