import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService } from '../movies/movie.service';
import { GenresService } from '../genres/genres.service';
import { FormatService } from '../formats/format.service';
import { LanguageService } from '../language/language.service';
import { CinemaService } from '../cinemas/cinema.service';
import { Movie } from '../interfaces/movie.interface.js';
import { Genre } from '../interfaces/genre.interface.js';
import { Format } from '../interfaces/format.interface.js';
import { Language } from '../interfaces/language.interface.js';
import { Cinema } from '../interfaces/cinema.interface.js';

@Component({
  selector: 'app-movie-edit',
  templateUrl: './movie-edit.component.html',
})
export class MovieEditComponent implements OnInit {

  movieId: number | null = null;
  isEditMode: boolean = false;
  errorMessage: string | null = null;
  movieForm: FormGroup;
  imageLink: string = '';
  movieData: Movie = {
    id: 0,
    name: '',
    duration: 0,
    description: '',
    imageLink: '',
    genres: [],
    cinemas: [],
    formats: [],
    languages: []
  }
  //esto es para obtener los genres, cinemas, etc actuales de la movie (su id)
  movieGenresIds: number[] = []
  movieFormatsIds: number[] = []
  movieLanguagesIds: number[] = []
  movieCinemasIds: number[] = []
  // esto para obetener todos los existentes
  allGenres: Genre[] = []
  allFormats: Format[] = []
  allLanguages: Language[] = []
  allCinemas: Cinema[] = []

  constructor(
    private route: ActivatedRoute, // Se usa para acceder a informacion de la ruta activa , en este caso para acceder al parametro id
    private movieService: MovieService,
    private genresService: GenresService,
    private formatService: FormatService,
    private languageService: LanguageService,
    private cinemaService: CinemaService,
    private router: Router //permite redirigir a una página diferente despues de que se haya completado alguna acción. (Ej: luego de crear la pelicula lo mando a la lista de peliculas)
  ) {

    //se inicializa dentro del constructor, para que este configurado y disponible para usarse
    this.movieForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      duration: new FormControl('', [Validators.required]),
      imageLink: new FormControl('', [Validators.required]),
    });

    // Actualiza imageLink en tiempo real
    this.movieForm.get('imageLink')?.valueChanges.subscribe((value: string) => {
      this.imageLink = value;
    });

  }

  ngOnInit(): void {
    //recupero el id de la ruta actual
    this.movieId = this.route.snapshot.params['id']

    if (this.movieId) {
      this.isEditMode = true;
      this.loadOneMovie();
    } else { // si no es edit mode igual tiene que cargar todas las relaciones para que el user pueda eleguir
      this.loadAllGenres();
      this.loadAllFormats();
      this.loadAllLanguages();
      this.loadAllCinemas();
    }
  }

  loadOneMovie() {
    if (this.movieId) {
      this.movieService.getOneMovie(this.movieId).subscribe({
        next: (respose) => {
          this.movieData = respose.data
          this.errorMessage = null;
          this.movieForm.setValue({
            name: this.movieData.name,
            description: this.movieData.description,
            duration: this.movieData.duration,
            imageLink: this.movieData.imageLink,
          });

          //map crea un nuevo array con todos los id de los genre de la pelicula
          this.movieGenresIds = this.movieData.genres.map(genre => genre.id).filter((id): id is number => id !== undefined);
          this.loadAllGenres();

          this.movieFormatsIds = this.movieData.formats.map(format => format.id).filter((id): id is number => id !== undefined)
          this.loadAllFormats();

          this.movieLanguagesIds = this.movieData.languages.map(language => language.id).filter((id): id is number => id !== undefined)
          this.loadAllLanguages();

          this.movieCinemasIds = this.movieData.cinemas.map(cinema => cinema.id).filter((id): id is number => id !== undefined)
          this.loadAllCinemas();
        },
        error: (err) => {
          this.errorMessage = 'An error occurred while fetching the movie.'
          console.error('Error getting movie:', err.error.message);
          this.router.navigate(['/manager-home/movies']); //por si se quiere meter a un id que no existe.
        }
      })
    }


  }

  loadAllGenres() {
    this.genresService.getGenres().subscribe({
      next: (response) => {
        this.allGenres = response.data; //guardo en allGenres todos los generos globales.
      },
      error: (err) => {
        console.error('Error getting all the genres', err.error.message)
      }
    })
  }

  loadAllFormats() {
    this.formatService.getFormats().subscribe({
      next: (response) => {
        this.allFormats = response.data;
      },
      error: (err) => {
        console.error('Error getting all formats', err.error.message)
      }
    })
  }

  loadAllLanguages() {
    this.languageService.getLanguages().subscribe({
      next: (response) => {
        this.allLanguages = response.data;
      },
      error: (err) => {
        console.error('Error getting all languages', err.error.message)
      }
    })
  }

  loadAllCinemas() {
    this.cinemaService.getAllCinemas().subscribe({
      next: (response) => {
        this.allCinemas = response.data;
      },
      error: (err) => {
        console.error('Error getting all cinemas', err.error.message)
      }
    })
  }

  saveMovie() {
    this.movieData.name = this.movieForm.get('name')?.value; //pongo los datos de del form en la movieData
    this.movieData.description = this.movieForm.get('description')?.value;
    this.movieData.duration = this.movieForm.get('duration')?.value;
    this.movieData.imageLink = this.movieForm.get('imageLink')?.value;

    // Guardamos los id de los generos actuales en movieData antes de guardarlo y le ponemos los datos que le faltan vacios para que no genere problemas de tipo.
    this.movieData.genres = this.movieGenresIds.map(id => ({ id, name: '' }));
    this.movieData.formats = this.movieFormatsIds.map(id => ({ id, formatName: '' }));
    this.movieData.languages = this.movieLanguagesIds.map(id => ({ id, languageName: '' }));
    this.movieData.cinemas = this.movieCinemasIds.map(id => ({ id, name: '', address: '', theaters: [], movies: [] }));

    if (this.isEditMode) {
      if (this.movieId) {
        this.movieService.updateMovie(this.movieId, this.movieData).subscribe({
          next: () => {
            this.errorMessage = null; //borra el mensaje de error por si viene alguno viejo arrastrado
            this.router.navigate(['/manager-home/movies'])
          },
          error: (err) => {
            this.errorMessage = 'Ocurrio un error al actualizar la pelicula.'
            console.error('Error updating movie:', err.error.message);
          }
        })
      }
    } else {
      this.movieService.addMovie(this.movieData).subscribe({
        next: () => {
          this.errorMessage = null;
          this.router.navigate(['/manager-home/movies'])
        },
        error: (err) => {
          if (err.error.message.includes('format or languages')) {
            this.errorMessage = 'Ocurrio un error al guardar la pelicula: La pelicula debe tener por lo menos un formato y un idioma.'
          } else if (err.error.message.includes('format or languages')) {
            this.errorMessage = 'Ocurrio un error al guardar la pelicula: La pelicula debe tener por lo menos un genero y un cine.'
          }
          this.errorMessage = 'Ocurrio un error al guardar la pelicula.'
          console.error('Error saving movie:', err.error.message);
        }
      })
    }
  }


  deleteMovie() {
    if (this.movieId) {
      this.movieService.deleteMovie(this.movieId).subscribe({
        next: () => {
          this.errorMessage = null;
          this.router.navigate(['/manager-home/movies'])
        },
        error: (err) => {
          if (err.error.message.includes('associated shows')) {
            this.errorMessage = 'No puede borrarse esta pelicula porque todavia tiene funciones asociadas.'
            console.error('Error deleting movie:', err.error.message);
            this.scrollToBottomError();
          } else {
            this.errorMessage = 'Ocurrio un error al eliminar la pelicula.'
            console.error('Error deleting movie:', err.error.message);
            this.scrollToBottomError();
          }
        }
      })
    }
  }

  // Manejan la seleccion de generos, formatos, etc.
  toggleGenreSelection(genreId: number) {
    const index = this.movieGenresIds.indexOf(genreId);
    if (index === -1) { // Si no esta en el array, lo agregamos
      this.movieGenresIds.push(genreId);
    } else { // Si ya esta, lo quitamos
      this.movieGenresIds.splice(index, 1);
    }
  }

  toggleFormatSelection(formatId: number) {
    const index = this.movieFormatsIds.indexOf(formatId);
    if (index === -1) {
      this.movieFormatsIds.push(formatId);
    } else {
      this.movieFormatsIds.splice(index, 1);
    }
  }

  toggleLanguageSelection(languageId: number) {
    const index = this.movieLanguagesIds.indexOf(languageId);
    if (index === -1) {
      this.movieLanguagesIds.push(languageId);
    } else {
      this.movieLanguagesIds.splice(index, 1);
    }
  }

  toggleCinemaSelection(cinemaId: number) {
    const index = this.movieCinemasIds.indexOf(cinemaId);
    if (index === -1) {
      this.movieCinemasIds.push(cinemaId);
    } else {
      this.movieCinemasIds.splice(index, 1);
    }
  }

  // Scrollea hacia abajo donde se muestran lo errores.
  scrollToBottomError() {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    });
  }


}
