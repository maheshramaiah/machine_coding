(function() {
  const titleEl = document.getElementById('title');
  const listsEl = document.getElementById('lists');
  const itemEl = document.getElementById('item');
  const lists = [];
  let id = 0;

  class List {
    constructor(title) {
      this.id = `items-${id++}`;
      this.title = title;
      this.items = [];

      this.createList();
    }

    addItem(item) {
      const li = document.createElement('li');
      const id = `${this.id}-${this.items.length}`;

      this.items.push({
        parentId: this.id,
        id,
        item
      });

      li.addEventListener('dragstart', this.onDragStart);
      li.setAttribute('draggable', true);
      li.setAttribute('id', id);
      li.innerHTML = `<h6 class="item-title">${item}</h6>`;

      document.getElementById(this.id).appendChild(li);
    }

    createList() {
      const li = document.createElement('li');

      li.addEventListener('drop', this.onDrop);
      li.addEventListener('dragover', this.onDragOver);
      li.innerHTML = `
        <h4 class='title'>${this.title}</h4>
        <ul class="list-items" id=${this.id}></ul>
      `;

      listsEl.appendChild(li);
    }

    onDragStart = (e) => {
      e.dataTransfer.setData(
        'data',
        JSON.stringify({
          item: this.items.find((i) => i.id === e.target.id)
        })
      );
    };

    onDrop = (e) => {
      const data = JSON.parse(e.dataTransfer.getData('data'));

      this.addItem(data.item.item);
      List.removeItem(data.item);
    };

    onDragOver(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    static removeItem(item) {
      const list = lists.find((l) => l.id === item.parentId);

      list.items.splice(list.items.findIndex((l) => l.id === item.id), 1);
      document.getElementById(item.parentId).removeChild(document.getElementById(item.id));
    }
  }

  function onEnter(fn) {
    return (e) => {
      e.keyCode === 13 && fn(e);
    };
  }

  titleEl.addEventListener(
    'keydown',
    onEnter((e) => {
      const title = e.target.value;
      const list = new List(title);

      lists.push(list);
    })
  );

  itemEl.addEventListener(
    'keydown',
    onEnter((e) => {
      if (lists.length) {
        lists[0].addItem(e.target.value);
      }
    })
  );
})();
