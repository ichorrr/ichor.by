import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';
import BgShader from '../components/BackShader';

const RESET_PASSWORD = gql`
  mutation resetPassword($token: String!, $password: String!) {
    resetPassword(token: $token, password: $password)
  }
`;

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [resetPassword, { loading, error }] = useMutation(RESET_PASSWORD, {
    onCompleted: data => {
      localStorage.setItem('token', data.resetPassword);
      setMessage('Пароль изменён. Сейчас вы будете перенаправлены.');
      setTimeout(() => navigate('/'), 800);
    }
  });

  const submit = event => {
    event.preventDefault();
    if (password !== confirmation) {
      setMessage('Пароли не совпадают.');
      return;
    }
    resetPassword({ variables: { token, password } });
  };

  return <>
    <div className="css-userform">
      <div className="wrapper">
        <h2>Новый пароль</h2>
        {!token ? <p className="err-message">В ссылке отсутствует токен восстановления.</p> : <form onSubmit={submit}>
          <label htmlFor="new-password">Новый пароль</label>
          <input id="new-password" type="password" required minLength="10" autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} />
          <small>10–128 символов: прописная и строчная буквы, цифра и специальный символ.</small>
          <label htmlFor="confirm-password">Повторите пароль</label>
          <input id="confirm-password" type="password" required minLength="10" autoComplete="new-password" value={confirmation} onChange={event => setConfirmation(event.target.value)} />
          <button className="save-note" type="submit" disabled={loading}>{loading ? 'Сохранение...' : 'Сохранить пароль'}</button>
        </form>}
        {error && <p className="err-message">{error.message}</p>}
        {message && <p>{message}</p>}
        <Link to="/signin">Перейти к авторизации</Link>
      </div>
    </div>
    <BgShader />
  </>;
};

export default ResetPassword;
