import styled from 'styled-components';

const ButtonAsLink = styled.button`
  background: none;
  color: #0077cc;
  border: none;
  padding-top: 22px;
  font: inherit;
  text-decoration: none;
  cursor: pointer;

  :hover,
  :active {
    text-decoration: none;
    color: #004499;
  }
`;

export default ButtonAsLink;
