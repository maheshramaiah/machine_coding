(function() {
  function getFavorites() {
    return JSON.parse(localStorage.getItem('favourites') || "[]")
  }

  function setFavorites(ids) {
    localStorage.setItem('favourites', JSON.stringify(ids));
  }

  async function getData() {
    try {
      const res = await fetch('http://localhost:8080/data.json');
      const data = await res.json();
      const favorites = getFavorites();

      return data
        .map(item => ({
          ...item,
          isFavorite: favorites.includes(item.id)
        }))
        .sort((a, b) => b.rating - a.rating);
    }
    catch (err) {
      return [];
    }
  }

  function debounce(fn, time) {
    let timeout;

    return (...args) => {
      timeout && clearTimeout(timeout);
      timeout = setTimeout(() => {
        fn(...args);
      }, time);
    }
  }

  window.addEventListener('DOMContentLoaded', async () => {
    const itemEl = document.getElementById("items");
    const searchEl = document.getElementById("search");
    const sortQueryEl = document.getElementById("sortQuery");
    const sortByEl = document.getElementById("sortBy");
    const tagsEl = document.getElementById("tags");
    let data = await getData();

    function generateView(data) {
      itemEl.innerHTML = '';

      data.forEach(item => {
        const li = document.createElement('li');

        li.setAttribute('data-id', item.id);
        li.innerHTML = `
          <h4>Name: ${item.name}</h4>
          <p>Ratings: ${item.rating}</p>
          <ul>
            ${item.tags.map(tag => `<li>${tag}</li>`)}
          </ul>
          <p>${item.isFavorite ? 'Favorite' : ''}</p>
        `;

        itemEl.appendChild(li);
      })
    }

    function generateTags(data) {
      let tags = [];

      data.reduce((ac, item) => {
        ac.push(...item.tags);

        return ac;
      }, tags);

      tags = [... new Set(tags)];

      tags.forEach(tag => {
        const option = document.createElement('option')

        option.textContent = tag;
        option.setAttribute("value", tag);

        tagsEl.appendChild(option);
      });
    }

    function onSearch(e) {
      const key = e.target.value;
      const searchData = data.filter(item => item.name.toLowerCase().includes(key.toLowerCase()));

      generateView(searchData);
    }

    function onSort(query, by) {
      let sortedData = [];

      switch (query) {
        case "rating": {
          sortedData = data.sort((a, b) => by === "asc" ? b.rating - a.rating : a.rating - b.rating);
        }
      }

      generateView(sortedData);
    }

    function filterByTag(e) {
      const value = e.target.value;
      const filteredData = value ? data.filter(item => item.tags.includes(value)) : data;

      generateView(filteredData);
    }

    function onFavourite(e) {
      const item = e.target.closest("[data-id]");
      const id = item.dataset.id;

      if (id) {
        const favorites = getFavorites();
        const item = data.find(item => item.id === +id);

        item.isFavorite = !item.isFavorite;
        const ids = item.isFavorite ? [...favorites, item.id] : favorites.filter(i => i !== +id);

        setFavorites(ids);
        generateView(data);
      }
    }

    generateView(data);
    generateTags(data);

    searchEl.addEventListener('keydown', debounce(onSearch, 500));

    sortQueryEl.addEventListener('change', e => {
      onSort(e.target.value, sortByEl.value);
    });
    sortByEl.addEventListener('change', e => {
      onSort(sortQueryEl.value, e.target.value)
    });

    tagsEl.addEventListener('change', filterByTag);

    itemEl.addEventListener('click', onFavourite);
  })
})();