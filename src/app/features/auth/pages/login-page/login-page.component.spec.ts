import { HttpErrorResponse } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AuthService } from '@core/auth/auth.service';
import { provideI18nTesting } from '@core/i18n/testing/i18n-testing';

import { LoginPageComponent } from './login-page.component';

describe('LoginPageComponent', () => {
  let fixture: ComponentFixture<LoginPageComponent>;
  let element: HTMLElement;
  let auth: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['login']);
    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideI18nTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: auth },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.resolveTo(true);
    fixture = TestBed.createComponent(LoginPageComponent);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  const emailInput = () => element.querySelector<HTMLInputElement>('input[type="email"]')!;
  const submit = async () => {
    element.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await fixture.whenStable();
  };

  it('shows the demo accounts and their password', () => {
    expect(element.textContent).toContain('admin@loja.com');
    expect(element.textContent).toContain('manager@loja.com');
    expect(element.querySelector('code')?.textContent).toBe('demo123');
  });

  it('fills the form with a demo account', async () => {
    element
      .querySelector<HTMLButtonElement>('[aria-label="Usar a conta manager@loja.com"]')!
      .click();
    await fixture.whenStable();
    expect(emailInput().value).toBe('manager@loja.com');
  });

  it('does not call the API while the form is invalid', async () => {
    await submit();
    expect(auth.login).not.toHaveBeenCalled();
    expect(element.textContent).toContain('Informe o e-mail.');
  });

  it('signs in and goes to the return url', async () => {
    auth.login.and.returnValue(
      of({ id: 1, name: 'Bruno', email: 'admin@loja.com', role: 'admin' }),
    );
    fixture.componentRef.setInput('returnUrl', '/orders?status=paid');
    element.querySelector<HTMLButtonElement>('[aria-label="Usar a conta admin@loja.com"]')!.click();
    await submit();

    expect(auth.login).toHaveBeenCalledWith({ email: 'admin@loja.com', password: 'demo123' });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/orders?status=paid');
  });

  it('ignores external return urls', async () => {
    auth.login.and.returnValue(
      of({ id: 1, name: 'Bruno', email: 'admin@loja.com', role: 'admin' }),
    );
    fixture.componentRef.setInput('returnUrl', '//evil.example.com');
    element.querySelector<HTMLButtonElement>('[aria-label="Usar a conta admin@loja.com"]')!.click();
    await submit();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });

  it('shows the API error inline', async () => {
    auth.login.and.returnValue(
      throwError(
        () =>
          new HttpErrorResponse({ status: 401, error: { error: 'E-mail ou senha inválidos.' } }),
      ),
    );
    element.querySelector<HTMLButtonElement>('[aria-label="Usar a conta admin@loja.com"]')!.click();
    await submit();

    expect(element.querySelector('[role="alert"]')?.textContent).toContain(
      'E-mail ou senha inválidos.',
    );
  });
});
