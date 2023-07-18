import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useApolloClient, gql } from '@apollo/client';
import styled from 'styled-components';
import Button from '../components/Button';
import UserForm from '../components/UserForm';
const Wrapper = styled.div`
  border: 2px solid #000;
  max-width: 500px;
  padding: 3em 7em 5em 6em;
  margin: 0 auto;
  border-radius: 1em;
  background: #e5f9fe;
`;

const Form = styled.form`
  label,
  input {
    display: block;
    line-height: 2em;
  }

  input {
    width: calc(100% - 1.8em);
    font-size: 1.3em;
    margin-bottom: 1em;
    padding: .4em .8em;
    color: #000;
    border-radius: .25em;
    border-style: solid;
  }
  label {
    font-size: 1.4em;
    padding: .3em 0;
  }
`;

const SIGNUP_USER = gql`mutation signUp($name: String!, $email: String!, $password: String!){
  signUp(name: $name, email: $email, password: $password)
}`;
import {GET_USER, GET_ME} from '../gql/query';
const SignUp = props => {
let navigate = useNavigate();
const [values, setValues] = useState();

const onChange = event => {
  setValues({
    ...values,
    [event.target.name]: event.target.value
  });
};

  useEffect(() => {
    document.title = 'Sign Up — ICHOR.BY aplication development';
  });

  const [signUp, { loading, error, refetch, networkStatus  }] = useMutation(SIGNUP_USER, {

    refetchQueries: [{query: GET_USER}, {query: GET_ME}],
    onCompleted: data => {
      localStorage.setItem('token', data.signUp);
      window.location.replace('/');
    }
  });
  if (loading) return (
    <div className="loading-signinup">
      <p>loading...</p>
    </div>)
if (error) return (
<div className="css-userform">
<div className="err-message">
  <h3>{error.message}</h3>
  <span>incorrect email or password</span>
  </div>
    <UserForm action={signUp} formType="signUp" />
  </div>
)
  return (
    <div className="css-userform">
      <UserForm action={signUp} formType="signUp" />
    </div>
  );
};

export default SignUp;
