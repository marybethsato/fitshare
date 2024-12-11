import Modal from "react-modal";

export default function PostCard({
  postId,
  router,
  authorName,
  authorUserId,
  postText,
  postImage,
  datePosted,
  comments,
  likes,
  showModal,
  showLikesModal,
  toggleModal,
  handleLikeToggle,
  handleCommentSubmit,
  handleCommentChange,
  handleDeleteComment,
  isLiked,
  newComment,
  showAllComments,
  setShowAllComments
}) {
  const initials = authorName
    .split(" ")
    .map((word) => word[0])
    .join("");

  const visibleComments = showAllComments ? comments : comments.slice(0, 3);

  return (
    <div key={postId} className="border rounded-lg shadow-sm p-4 bg-white max-w-4xl">
      {/* Header */}
      <div className="flex items-center mb-4">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-300 rounded-full">
          <span className="font-bold text-lg text-gray-800" onClick={() => router.push(`/profile?userId=${authorUserId}`)}>{initials}</span>
        </div>
        <div className="ml-3">
          <h3 className="font-bold text-lg" onClick={() => router.push(`/profile?userId=${authorUserId}`)}>{authorName}</h3>
          <p className="text-xs text-gray-400"> {new Date(datePosted).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Post Content */}
      <p className="text-gray-700 mb-4">{postText}</p>

      {/* Post Image */}
      {postImage && (
        <div
          className="rounded-lg overflow-hidden mb-4 cursor-pointer"
          onClick={() => toggleModal(postId, "showModal")}
        >
          <img
            src={postImage}
            alt="Post Image"
            width={1000}
            height={400}
            className="h-[50vh] object-cover object-top"
          />
        </div>
      )}

      {/* Image Modal */}
      <Modal
        isOpen={showModal}
        onRequestClose={() => toggleModal(postId, "showModal")}
        ariaHideApp={false}
        style={{
          content: {
            width: "80%",
            height: "80%",
            margin: "auto",
            borderRadius: "10px",
            padding: "0",
            position: "relative",
            overflow: "hidden", // Prevent scrolling
            display: "flex", // Center content
            alignItems: "center",
            justifyContent: "center",
          },
        }}
      >
        <button
          onClick={() => toggleModal(postId, "showModal")}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            backgroundColor: "transparent",
            color: "black",
            border: "none",
            cursor: "pointer",
            fontSize: "20px",
          }}
        >
          ✕
        </button>
        <img
          src={postImage}
          alt="Post Image"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain", // Ensure the image fits perfectly within the modal
          }}
        />
      </Modal>

      {/* Post Actions */}
      <div className="flex flex-row gap-2">

        <button
          onClick={() => handleLikeToggle(postId, isLiked)}
          className="flex items-center space-x-2 focus:outline-none"
        >
          <div
            className={`h-5 w-5 rounded-full ${isLiked ? 'bg-red-500' : 'bg-gray-300'} flex items-center justify-center`}
          >
            <span className="text-white text-sm">&#10084;</span>
          </div>

        </button>

        <span onClick={() => toggleModal(postId, "showLikesModal")} className="text-gray-800">{likes?.length || 0} Likes</span>

      </div>



      {/* Likes Modal */}
      <Modal
        isOpen={showLikesModal}
        onRequestClose={() => toggleModal(postId, "showLikesModal")}
        ariaHideApp={false}
        style={{
          content: {
            width: "300px",
            height: "400px",
            margin: "auto",
            borderRadius: "10px",
            padding: "20px",
            position: "relative",
          },
        }}
      >
        <button
          onClick={() => toggleModal(postId, "showLikesModal")}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            backgroundColor: "transparent",
            color: "black",
            border: "none",
            cursor: "pointer",
            fontSize: "20px",
          }}
        >
          ✕
        </button>
        <ul style={{ listStyle: "none", padding: "0", marginTop: "20px" }}>
          Liked by:
          {likes.map((like, idx) => (
            <li key={idx} style={{ marginBottom: "10px" }}>
              - {like.userName}
            </li>
          ))}
        </ul>
      </Modal>

      {/* Comments Section */}
      <div className="mt-4">
        <h4 className="text-sm font-semibold text-gray-800">Comments:</h4>
        {comments && comments.length > 0 ? (
          <ul className="mt-2 space-y-2">
            {visibleComments.map((comment) => (
              <li
                key={comment.id}
                className="flex items-start space-x-3 rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-800"  >
                <div
                  onClick={() => router.push(`/profile?userId=${comment.userId}`)}
                  className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                  {comment.userName
                    .split(" ")
                    .map((name) => name[0])
                    .join("")
                    .toUpperCase()}
                </div>

                <div className="flex-1">
                  <p className="font-semibold" onClick={() => router.push(`/profile?userId=${comment.userId}`)}>{comment.userName}</p>
                  <p>{new Date(comment.createdAt).toLocaleString()}</p>
                  <p className="pt-2">{comment.commentText}</p>
                </div>
                {
                  comment.userId == localStorage.getItem('userId') ?
                    <button
                      onClick={() => handleDeleteComment(postId, comment.id)}
                      className="ml-auto text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button> : null
                }
              </li>
            ))}
            {comments.length > 3 && !showAllComments && (
              <button
                onClick={() => setShowAllComments(true)}
                className="text-blue-500 hover:underline"
              >
                Show all comments
              </button>
            )}
            {showAllComments && (
              <button
                onClick={() => setShowAllComments(false)}
                className="text-blue-500 hover:underline"
              >
                Show less
              </button>
            )}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-gray-500">No comments available.</p>
        )}

        {/* Add Comment */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCommentSubmit(postId, newComment[postId]);
          }}
          className="mt-2 flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder="Add a comment..."
            value={newComment[postId] || ""}
            onChange={(e) => handleCommentChange(e, postId)}
            className="flex-1 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:border-blue-400 focus:ring focus:ring-blue-300 focus:ring-opacity-40"
            required
          />
          <button
            type="submit"
            className="rounded-md bg-green-500 px-3 py-1 text-white hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-300 focus:ring-opacity-50"
          >
            Comment
          </button>
        </form>
      </div>
    </div>
  );
}
