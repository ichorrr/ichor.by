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

    console.log(values);
  };

  return (
    <div className='wrapper'>

      {/* Display the appropriate form header */}
      {props.formType === 'signUp' ? <h2>Sign Up</h2> : <h2>Sign In</h2>}
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
      <label htmlFor="name">Username</label>
      <input
        required
        type="text"
        id="name"
        name="name"
        placeholder="name"
        onChange={onChange}
      />
    </React.Fragment>)}
      <label htmlFor="email">Email</label>
        <input
          required
          type="text"
          id="email"
          name="email"
          placeholder="Email"
          onChange={onChange}
        />
        <label htmlFor="password">Password</label>
        <input
          required
          type="password"
          id="password"
          name="password"
          placeholder="Password"
          onChange={onChange}
        />
        <div className='empty-div-half'></div>
        {props.formType === 'signUp' ? (<button className="save-note" type="submit">Create Account</button>) :(<button className="save-note-in" type="submit">Log in now</button>)}
      </Form>
    </div>
  );
};

export default UserForm;
