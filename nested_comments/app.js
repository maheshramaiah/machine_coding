(function() {
  class Comment {
    constructor(id, name, comment, parent) {
      this.id = id.toString();
      this.name = name;
      this.comment = comment;
      this.parent = parent;
      this.children = [];
    }

    renderComment() {
      const li = document.createElement('li');

      li.setAttribute('id', `${this.id}`);
      li.innerHTML = `
        <span>${this.comment}</span>
        <span>${this.name}</span>
        <a id='reply-${this.id}'>Reply</a>
        <ul id='list-${this.id}'></ul>
      `;

      const id = this.parent ? `list-${this.parent}` : 'list';
      document.getElementById(id).appendChild(li);
    }

    renderCommentPlaceholder() {
      const el = document.getElementById(this.id);
      const div = document.createElement('div');

      div.setAttribute('id', `child-comment-${this.id}`);
      div.innerHTML = `
        <input type='text' placeholder='name' id='name-${this.id}'/>
        <textarea placeholder='comment' id='comment-${this.id}'></textarea>
        <button id='add-${this.id}'>Reply</button>
      `;

      el.appendChild(div);
    }

    static findComment(comments, id) {
      for (let i = 0; i < comments.length; i++) {
        if (comments[i].id === id) {
          return comments[i];
        }
        const comment = Comment.findComment(comments[i].children, id);

        if (comment) {
          return comment;
        }
      }
    }

    static saveComments(comments) {
      localStorage.setItem('comments', JSON.stringify(comments));
    }

    static constructCommentsObj(saveComments = [], comments = []) {
      saveComments.forEach((c) => {
        const comment = new Comment(c.id, c.comment, c.name, c.parent);
        comments.push(comment);

        if (c.children.length) {
          Comment.constructCommentsObj(c.children, comment.children);
        }
      });

      return comments;
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    let comments = Comment.constructCommentsObj(JSON.parse(localStorage.getItem('comments')));

    if (comments.length) {
      (function renderComments(comments) {
        comments.forEach((c) => {
          c.renderComment();
          if (c.children) {
            renderComments(c.children);
          }
        });
      })(comments);
    }

    document.getElementById('submit').addEventListener('click', () => {
      const comment = new Comment(
        comments.length,
        document.getElementById('comment').value,
        document.getElementById('name').value
      );

      comments.push(comment);
      comment.renderComment();
      Comment.saveComments(comments);
    });

    document.getElementById('list').addEventListener('click', (e) => {
      const elId = e.target.id;

      if (elId) {
        const [action, id] = elId.split('-');
        const parentComment = Comment.findComment(comments, id);

        if (action === 'reply') {
          parentComment.renderCommentPlaceholder();
        } else if (action === 'add') {
          const comment = new Comment(
            `${id}${parentComment.children.length}`,
            document.getElementById(`comment-${id}`).value,
            document.getElementById(`name-${id}`).value,
            id
          );

          parentComment.children.push(comment);
          comment.renderComment();
          document.getElementById(`child-comment-${id}`).remove();
          Comment.saveComments(comments);
        }
      }
    });
  });
})();
