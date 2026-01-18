import React, { useState } from 'react';
import styled from 'styled-components';

const Form = styled.form`
  label,
  input {
    display: block;
  }

  input {
    width: calc(100% - 1.8em);
    margin-bottom: 1em;
    padding: .6em .8em;
    color: #000;
    border-radius: .25em;
    border-style: solid;
  }
  
  label {
    padding: .3em 0;
    color: #fff;
  }
`;

const UserForm = props => {
  // set the default state of the form
  const [values, setValues] = useState();

  // update the state when a user types in the form
  const onChange = event => {
    setValues({
      ...values,
      [event.target.name]: event.target.value
    });
  };

  return (
    <div className='wrapper'>

      {/* Display the appropriate form header */}
      {props.formType === 'signUp' ? <h2>Регистрация</h2> : <h2>Авторизация</h2>}
      {/* perform the mutation when a user submits the form */}
      <Form 
        onSubmit={event => {

          event.preventDefault();
          props.action({
            variables: {
              ...values
            }
          });
        }}
      >
      {props.formType === 'signUp' &&(
        <React.Fragment>
      <label htmlFor="name">Имя пользователя</label>
      <input
        required
        type="text"
        id="name"
        name="name"
        placeholder="Name"
        onChange={onChange}
      />
    </React.Fragment>)}
      <label htmlFor="email">Электронная почта</label>
        <input
          required
          type="text"
          id="email"
          name="email"
          
          placeholder="E-mail"
          onChange={onChange}
        />
        <label htmlFor="password">Пароль</label>
        <input
          required
          type="password"
          id="password"
          name="password"
          placeholder="Password"
          autoComplete="new-password"
          onChange={onChange}
        />
        <div className='empty-div-half'></div>
        {props.formType === 'signUp' ? (<button className="save-note" type="submit">Создать аккаунт</button>) :(<button className="save-note-in" type="submit">Войти</button>)}
      </Form>
    </div>
  );
};

export default UserForm;
