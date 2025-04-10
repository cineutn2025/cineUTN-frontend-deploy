import { Component, OnInit } from '@angular/core';
import { GenresService } from './genres.service';
import { Router } from '@angular/router';
import { Genre } from '../interfaces/genre.interface.js';

@Component({
  selector: 'app-genres',
  templateUrl: './genres.component.html',
})
export class GenresComponent implements OnInit {
  genres: Genre[] = [];
  errorMessage: string | null = null;
  loading: boolean = true;

  constructor(
    private service: GenresService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadGenres()
  }

  loadGenres() {
    this.service.getGenres().subscribe({
      next: (response) => {
        this.genres = response.data;
        this.errorMessage = null;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Ocurrio un error buscando los generos, intente nuevamente.';
        console.error('Error getting genre:');
        this.loading = false;
      },
    });
  }

}
