import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
let page = 1;
let query = '';
let lightbox = new SimpleLightbox('.gallery a');

form.addEventListener('submit', async e => {
  e.preventDefault();
  gallery.innerHTML = ''; // Clear previous results
  query = e.target.searchQuery.value.trim();
  page = 1;
  if (query === '') {
    Notiflix.Notify.failure('Please enter a search query.');
    return;
  }
  fetchImages();
});

loadMoreBtn.addEventListener('click', () => {
  page += 1;
  fetchImages();
});

async function fetchImages() {
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: '45702764-074dc4323a25c44256914ed69',
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: page,
        per_page: 40,
      },
    });
    const images = response.data.hits;
    const totalHits = response.data.totalHits;

    if (images.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      loadMoreBtn.style.display = 'none';
      return;
    }

    if (page === 1) {
      Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
    }

    renderImages(images);

    if (page * 40 >= totalHits) {
      loadMoreBtn.style.display = 'none';
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    } else {
      loadMoreBtn.style.display = 'block';
    }
  } catch (error) {
    console.error(error);
    Notiflix.Notify.failure('An error occurred while fetching images.');
  }
}

function renderImages(images) {
  const markup = images
    .map(image => {
      return `
            <div class="photo-card">
                <a href="${image.largeImageURL}">
                    <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
                </a>
                <div class="info">
                    <p class="info-item"><b>Likes</b>: ${image.likes}</p>
                    <p class="info-item"><b>Views</b>: ${image.views}</p>
                    <p class="info-item"><b>Comments</b>: ${image.comments}</p>
                    <p class="info-item"><b>Downloads</b>: ${image.downloads}</p>
                </div>
            </div>
        `;
    })
    .join('');
  gallery.insertAdjacentHTML('beforeend', markup);
  lightbox.refresh(); // Refresh lightbox with new elements

  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
