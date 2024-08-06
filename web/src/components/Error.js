import React from 'react'


const Error = ({text}) => {

    return (
        <div className="ErrorBlock">
            <div>
                <span>{text}</span>
            </div>
        </div>
      );
}

export default Error;