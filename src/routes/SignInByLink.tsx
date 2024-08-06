import React from 'react';
import { signInByLink } from '../firestore';
import { ActionFunction, Form, redirect, useNavigation } from 'react-router-dom';
import { log } from '../config';

export const signInByLinkAction: ActionFunction = async ({request}) => {
  const formData = await request.formData()
  const email = formData.get('email')
  log('signInLinkAction', email)
  if (!email || typeof email !== 'string') {
    return redirect(`/signInByLink`)
  }
  await signInByLink(email)
  return redirect(`/signInSent?email=${email}`)
}

export const SignInByLink: React.FC = () => {
  const navigation = useNavigation();
  const busy = navigation.state === "submitting";

  return <div>
    <div>Sign In</div>
    <Form method="post" action="/sendSignInLink">
      Email: <input type='text' name="email"/>
      <button type="submit" disabled={busy}> {busy ? "Creating..." : "Sign In"}</button>
    </Form>
  </div>
}
