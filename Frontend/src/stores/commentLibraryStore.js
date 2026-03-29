import { makeAutoObservable } from 'mobx';

class CommentLibraryStore {
  categories = {
    1: { id: '1', name: 'Presentation Structure' },
    2: { id: '2', name: 'Content Quality' },
    3: { id: '3', name: 'Delivery Style' },
    4: { id: '4', name: 'Visual Design' },
    5: { id: '5', name: 'Audience Engagement' },
  };

  comments = {
    positive: [
      {
        id: 1,
        content: 'Excellent structure and flow',
        type: 'positive',
        categoryId: '1',
      },
      {
        id: 2,
        content: 'Well-organized presentation',
        type: 'positive',
        categoryId: '1',
      },
    ],
    neutral: [
      {
        id: 3,
        content: 'Adequate structure',
        type: 'neutral',
        categoryId: '1',
      },
      {
        id: 4,
        content: 'Standard presentation format',
        type: 'neutral',
        categoryId: '1',
      },
    ],
    negative: [
      {
        id: 5,
        content: 'Lacks clear structure',
        type: 'negative',
        categoryId: '1',
      },
      {
        id: 6,
        content: 'Disorganized content flow',
        type: 'negative',
        categoryId: '1',
      },
    ],
  };

  constructor() {
    makeAutoObservable(this);
  }

  get commentList() {
    return this.comments;
  }

  getCommentsByCategory(categoryId) {
    return {
      positive: this.comments.positive.filter(
        (comment) => comment.categoryId === categoryId
      ),
      neutral: this.comments.neutral.filter(
        (comment) => comment.categoryId === categoryId
      ),
      negative: this.comments.negative.filter(
        (comment) => comment.categoryId === categoryId
      ),
    };
  }

  getCategoryName(categoryId) {
    return this.categories[categoryId]?.name || 'Unknown Category';
  }

  addComment(comment) {
    const newComment = {
      ...comment,
      id: Date.now() + Math.random(),
    };

    if (this.comments[comment.type]) {
      this.comments[comment.type].push(newComment);
    }
  }

  deleteComment(commentId) {
    Object.keys(this.comments).forEach((type) => {
      this.comments[type] = this.comments[type].filter(
        (comment) => comment.id !== commentId
      );
    });
  }

  clearComments() {
    this.comments = {
      positive: [],
      neutral: [],
      negative: [],
    };
  }
}

export default new CommentLibraryStore();
