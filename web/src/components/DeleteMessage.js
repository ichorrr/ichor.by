import { useMutation } from "@apollo/client";
import { DELETE_MESSAGE } from "../gql/mutation.js";
import { GET_MY_USERS } from "../gql/query";

const DeleteMessage = ({ id, chatId }) => {
  const [deleteMessage] = useMutation(DELETE_MESSAGE, {
    variables: { id },
    refetchQueries: [{ query: GET_MY_USERS }],
    awaitRefetchQueries: true,
  });
    const handleDelete = () => {
    deleteMessage()
        .then(() => {
            console.log("Message deleted successfully");
        })
        .catch((error) => {
            console.error("Error deleting message:", error);
        });
    };
    return (
        <button onClick={handleDelete} className="delete-message-button">
            Удалить
        </button>
    );
}   
export default DeleteMessage;