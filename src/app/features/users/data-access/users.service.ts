import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { User } from '@core/models';

/** Admin-only API (the backend answers 403 to managers). */
@Injectable()
export class UsersService {
  private readonly http = inject(HttpClient);

  list(): Observable<User[]> {
    return this.http.get<User[]>('api/users');
  }

  update(user: User): Observable<User> {
    return this.http.put<User>(`api/users/${user.id}`, user);
  }
}
