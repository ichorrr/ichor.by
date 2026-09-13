import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';
import BgShader from '../components/BackShader';

const REQUEST_RESET = gql`
  mutation requestPasswordReset($email: String!) {
    requestPasswordReset(email: $email)
  }
`;

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [requestReset, { loading, error }] = useMutation(REQUEST_RESET, {
    onCompleted: data => setMessage(data.requestPasswordReset)
  });

  return <>
    <div className="css-userform">
      <div className="wrapper">
        <h2>Восстановление пароля</h2>
        <p>Укажите email — мы отправим одноразовую ссылку для создания нового пароля.</p>
        <form onSubmit={event => { event.preventDefault(); requestReset({ variables: { email } }); }}>
          <label htmlFor="reset-email">Электронная почта</label>
          <input id="reset-email" type="email" required value={email} onChange={event => setEmail(event.target.value)} />
          <button className="save-note" type="submit" disabled={loading}>{loading ? 'Отправка...' : 'Отправить ссылку'}</button>
        </form>
        {error && <p className="err-message">{error.message}</p>}
        {message && <p>{message}</p>}
        <Link to="/signin">Вернуться к авторизации</Link>
      </div>
    </div>
    <BgShader />
  </>;
};

export default ForgotPassword;
