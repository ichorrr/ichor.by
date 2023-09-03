import React, { useState } from 'react';
import styled from 'styled-components';
import { useMutation, InMemoryCache, writeQuery, useQuery, useApolloClient, gql } from '@apollo/client';


import Button from './Button';

const Wrapper = styled.div`

  max-width: 500px;
  padding: 3em 7em 5em 6em;
  margin: 0 auto;
  border-radius: 1em;
  background-color: rgba(69, 214, 255, .1);
  backdrop-filter: blur(20px);
`;

const Form = styled.form`
  label,
  input {
    display: block;
    line-height: 2em;
    font-size: 1.3em;
  }

  input {
    width: calc(100% - 1.8em);
    margin-bottom: 1em;
    padding: .4em .8em;
    color: #000;
    border-radius: .25em;
    border-style: solid;
  }
  
  label {
    font-size: 1.4em;
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
    <Wrapper>

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
        {props.formType === 'signUp' ? (<Button type="submit">Create Account</Button>) :(<Button type="submit">Log in now</Button>)}
      </Form>
    </Wrapper>
  );
};

export default UserForm;
