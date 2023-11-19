import React from 'react'


const Modal = ({act, setAct, children}) => {

    const onChange = (modal) => {
        setModal({modal});
      };

    return (
        <div className={act ? "modal active" : "modal"} onClick={() => setAct(false)}>
            <div className='modal-content' onClick={e => e.stopPropagation()}>
                {children}
            </div>
        </div>
      );
}

export default Modal;