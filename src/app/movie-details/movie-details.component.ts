import { Component, EventEmitter, OnInit } from '@angular/core';
import { MovieDetailsService } from './movie-details.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Movie } from '../interfaces/movie.interface.js';
import { Cinema } from '../interfaces/cinema.interface.js';
import { Show } from '../interfaces/show.interface.js';
import { Format } from '../interfaces/format.interface.js';
import { Language } from '../interfaces/language.interface.js';


@Component({
  selector: 'app-movie-details',
  templateUrl: './movie-details.component.html',
})



export class MovieDetailsComponent implements OnInit {

  isOpen = false;
  movieId: number = 0;
  cinemaId: number | null = null;
  movie: Movie | null = null;
  cinemas: Cinema[] = [];
  shows: Show[] = [];
  days: { name: string; date: Date }[] = [];
  formats: Format[] = [];
  languages: Language[] = [];
  cinema: Cinema | null = null;
  isCinemaLoaded: boolean = false;
  isDetailsOpen: boolean = false;
  daySelected: string = 'Hoy';
  filteredShows: Show[] = [];
  messageWarning = '';
  isLoggedIn = false;

  constructor(
    private movieDetailsService: MovieDetailsService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) { }


  ngOnInit() {
    this.movieId = Number(this.route.snapshot.paramMap.get('id'));
    this.route.queryParams.subscribe((params) => {
      this.cinemaId = params['cinemaId'] ? Number(params['cinemaId']) : null;
    });
    if (!this.cinemaId) {
      this.isCinemaLoaded = true;
    }
    this.loadMovieDetails(this.movieId);
    this.loadDataSelector();
    this.days = this.getNextDays();
    this.loadLanguages();
    this.loadFormats();
    this.authService.isLoggedIn().subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
    });
  }

  loadDataSelector() {
    this.movieDetailsService.getAllCinemasByMovie(this.movieId).subscribe({
      next: (cinemas) => {
        this.cinemas = cinemas;
        if (this.cinemaId != null) {
          this.cinema =
            this.cinemas.find((cinema) => cinema.id == this.cinemaId) || null;
          this.isCinemaLoaded = true;
          this.loadShows(this.movieId, this.cinemaId);
        }
      },
      error: () => {
        console.error('Error loading Data:');
        this.cinemas = [];
      },
    });
  }

  getNextDays(): { name: string; date: Date }[] {
    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado',];
    const daysArray: { name: string; date: Date }[] = [];
    const today = new Date();
    const todayIndex = today.getDay();
    let currentDate = new Date(today);
    daysArray.push({ name: 'Hoy', date: new Date(today) });
    currentDate.setDate(today.getDate() + 1);
    daysArray.push({ name: 'Mañana', date: new Date(currentDate) });
    for (let i = 2; i <= 7; i++) {
      currentDate.setDate(today.getDate() + i);
      const nextDayIndex = (todayIndex + i) % 7;
      daysArray.push({
        name: daysOfWeek[nextDayIndex],
        date: new Date(currentDate),
      });
    }
    return daysArray;
  }

  loadShows(movieId: number, cinemaId: number) {
    this.movieDetailsService.getAllShowsByMovieAndCinema(movieId, cinemaId).subscribe({
      next: (shows) => {
        this.shows = shows;
        this.filterShows();
      },
      error: () => {
      },
    });
  }

  loadMovieDetails(id: number) {
    this.movieDetailsService.getMovieDetails(id).subscribe({
      next: (movie) => {
        this.movie = movie;
      },
      error: () => {
        this.movie = null;
      },
    });
  }

  loadFormats() {
    this.movieDetailsService.getAllFormats().subscribe({
      next: (format) => {
        this.formats = format;
      },
      error: () => {
        this.formats = [];
      },
    });
  }

  loadLanguages() {
    this.movieDetailsService.getAllLanguages().subscribe({
      next: (language) => {
        this.languages = language;
      },
      error: () => {
        this.languages = [];
      },
    });
  }

  filterShows() {
    const day = this.days.find((day) => day.name === this.daySelected);
    this.filteredShows = this.shows.filter(
      (show) => new Date(show.dayAndTime).getDate() === day?.date.getDate()
    );
    if (this.filteredShows.length === 0) {
    }
  }

  getShowHourAndDay(show: Show) {
    let showHour;
    showHour = this.movieDetailsService.getShowHourAndDay(show);
    return showHour
  }

  handleItemSelected(item: Cinema | { clear: string }): void {
    if ('clear' in item) {
      this.cinema = null;
      this.shows = []
      this.filteredShows = [];
    } else {
      this.cinema = item;
      this.loadShows(this.movieId, this.cinema.id);
    }
  }

  handleChangeOption(option: boolean) {
    this.isDetailsOpen = option;
  }

  handleDaySelected(day: string) {
    this.daySelected = day;
    this.filterShows();
  }


  warningModal(show: Show) {
    if (this.isLoggedIn) {
      this.router.navigate([`/buy/${show.id}`]);
    } else {
      this.isOpen = true;
    }
  }


  loguearse() {
    this.router.navigate(['/login']);
  }
}
