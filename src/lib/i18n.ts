import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export const translations = {
  en: {
    // General
    appName: 'SalonMinder',
    save: 'Save',
    add: 'Add',
    edit: 'Edit',

    // Navigation
    dashboard: 'Dashboard',
    clients: 'Clients',
    calendar: 'Calendar',
    settings: 'Settings',
    logout: 'Log Out',
    pets: 'Pets',

    // Auth
    'login.title': 'Welcome back!',
    'login.subtitle': 'Sign in to manage your salon',
    'login.button': 'Sign In',
    'login.no_account': "Don't have an account?",
    'login.register': 'Register',
    'register.title': 'Create your account',
    'register.subtitle': 'Get started with SalonMinder',
    'register.button': 'Create Account',
    'register.has_account': 'Already have an account?',
    'register.login': 'Log In',
    email: 'Email',
    password: 'Password',
    'salon.name': 'Salon Name',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.appointments_today': 'Appointments Today',
    'dashboard.total_clients': 'Total Clients',
    'dashboard.upcoming_appointments': 'Upcoming Appointments',
    'dashboard.time': 'Time',
    'dashboard.pet': 'Pet',
    'dashboard.services': 'Services',
    'dashboard.view_all_appointments': 'View all appointments',

    // Clients
    'clients.title': 'Clients',
    'clients.add': 'Add Client',
    'clients.add_description': 'Enter the details for the new client.',
    'clients.name': 'Name',
    'clients.phone': 'Phone',
    'clients.pets': 'Pets',
    'clients.surname': 'Surname',
    cancel: 'Cancel',
    'clients.delete': 'Delete Client',
    'clients.delete_confirm_message':
      'Are you sure you want to delete this client? This action cannot be undone.',

    // Client Details
    'client.details': 'Client Details',
    'client.contact_info': 'Contact Information',
    'client.pets_owned': 'Pets',
    'client.add_pet': 'Add Pet',
    'client.add_pet_description': 'Enter the details for the new pet.',
    'client.select_owner': 'Select an owner',
    'client.delete': 'Delete Client',

    // Pet Profile
    'pet.profile': 'Pet Profile',
    'pet.name': 'Name',
    'pet.breed': 'Breed',
    'pet.age': 'Age',
    'pet.grooming_notes': 'Grooming Notes',
    'pet.visit_history': 'Visit History',
    'pet.date': 'Date',
    'pet.notes': 'Notes',
    'pet.price': 'Price',
    'pet.edit_profile': 'Edit Profile',
    'pet.type': 'Type',
    'pet.delete': 'Delete Pet',
    'pet.delete_confirm_message':
      'Are you sure you want to delete this pet? This action cannot be undone.',
    'pet.no_owner': 'No owner',
    'pet.add_visit': 'Add Visit',
    'pet.add_visit_description': "Add a new visit entry to this pet's history.",
    'pet.visit_date': 'Visit Date',
    'pet.visit_notes': 'Visit Notes',
    'pet.visit_notes_placeholder':
      'Enter details about the visit (services performed, observations, etc.)',
    'pet.notes_char_limit': 'Maximum 2000 characters',
    'pet.adding_visit': 'Adding...',
    'pet.no_visits': 'No visits recorded',
    'pet.no_visits_description':
      "Add the first visit to start tracking this pet's grooming history.",
    'pet.visit_added_on': 'Added on',
    'pet.delete_visit_confirm':
      'Are you sure you want to delete this visit? This action cannot be undone.',
    'pet.loading_visits': 'Loading visits...',
    'pet.edit_visit': 'Edit Visit',
    'pet.edit_visit_description': 'Update the visit date and notes as needed.',
    'pet.notes_required': 'Notes are required',
    'pet.error_updating_visit': 'Failed to update visit. Please try again.',

    // Photos
    'pet.add_photos': 'Add Photos',
    'pet.add_photos_description': 'Add photos to document this visit.',
    'pet.visit_created_successfully':
      'Visit created successfully! You can now add photos.',
    'pet.finish_adding_photos': 'Finish',
    'pet.drag_photos_or_click': 'Drag photos here or click to select',
    'pet.drop_photos_here': 'Drop photos here',
    'pet.photo_requirements': 'JPEG, PNG, WebP up to 10MB each',
    'pet.photos_remaining': '{count} photos remaining',
    'pet.max_photos_reached': 'Maximum {max} photos allowed',
    'pet.too_many_photos': 'Only {max} more photos allowed',
    'pet.max_photos_reached_message':
      'Maximum of {max} photos per visit reached.',
    'pet.uploading_photos': 'Uploading photos...',
    'pet.no_photos': 'No photos for this visit',
    'pet.photos_count': '{count} photo',
    'pet.photos_count_plural': '{count} photos',
    'pet.delete_photo_confirm':
      'Are you sure you want to delete this photo? This action cannot be undone.',
    'pet.lightbox_controls': 'Use arrow keys to navigate, ESC to close',
    download: 'Download',

    are_you_sure: 'Are you sure?',
    delete: 'Delete',
    actions: 'Actions',
    saving: 'Saving...',
    save_changes: 'Save Changes',

    // Pets
    'pets.title': 'Pets',
    'pets.search_placeholder': 'Search by pet name...',
    'pets.name': 'Name',
    'pets.breed': 'Breed',
    'pets.age': 'Age',
    'pets.owner': 'Owner',
    view: 'View',
  },
  pl: {
    // General
    appName: 'SalonMinder',
    save: 'Zapisz',
    add: 'Dodaj',
    edit: 'Edytuj',

    // Navigation
    dashboard: 'Panel',
    clients: 'Klienci',
    calendar: 'Kalendarz',
    settings: 'Ustawienia',
    logout: 'Wyloguj się',

    // Auth
    'login.title': 'Witaj z powrotem!',
    'login.subtitle': 'Zaloguj się, aby zarządzać swoim salonem',
    'login.button': 'Zaloguj się',
    'login.no_account': 'Nie masz konta?',
    'login.register': 'Zarejestruj się',
    'register.title': 'Utwórz swoje konto',
    'register.subtitle': 'Rozpocznij pracę z SalonMinder',
    'register.button': 'Utwórz konto',
    'register.has_account': 'Masz już konto?',
    'register.login': 'Zaloguj się',
    email: 'Email',
    password: 'Hasło',
    'salon.name': 'Nazwa salonu',

    // Dashboard
    'dashboard.title': 'Panel',
    'dashboard.appointments_today': 'Dzisiejsze wizyty',
    'dashboard.total_clients': 'Liczba klientów',
    'dashboard.upcoming_appointments': 'Nadchodzące wizyty',
    'dashboard.time': 'Godzina',
    'dashboard.pet': 'Zwierzak',
    'dashboard.services': 'Usługi',
    'dashboard.view_all_appointments': 'Zobacz wszystkie wizyty',

    // Clients
    'clients.title': 'Klienci',
    'clients.add': 'Dodaj klienta',
    'clients.add_description': 'Wprowadź dane nowego klienta.',
    'clients.name': 'Imię i nazwisko',
    'clients.phone': 'Telefon',
    'clients.pets': 'Zwierzęta',
    'clients.surname': 'Nazwisko',
    cancel: 'Anuluj',
    'clients.delete': 'Usuń klienta',
    'clients.delete_confirm_message':
      'Czy na pewno chcesz usunąć tego klienta? Tej operacji nie można cofnąć.',

    // Client Details
    'client.details': 'Szczegóły klienta',
    'client.contact_info': 'Informacje kontaktowe',
    'client.pets_owned': 'Zwierzęta',
    'client.add_pet': 'Dodaj zwierzaka',
    'client.add_pet_description': 'Wprowadź dane nowego zwierzaka.',
    'client.select_owner': 'Wybierz właściciela',
    'client.delete': 'Usuń klienta',

    // Pet Profile
    'pet.profile': 'Profil zwierzaka',
    'pet.name': 'Imię',
    'pet.breed': 'Rasa',
    'pet.age': 'Wiek',
    'pet.grooming_notes': 'Notatki pielęgnacyjne',
    'pet.visit_history': 'Historia wizyt',
    'pet.date': 'Data',
    'pet.notes': 'Notatki',
    'pet.price': 'Cena',
    'pet.edit_profile': 'Edytuj profil',
    'pet.type': 'Typ',
    'pet.delete': 'Usuń zwierzaka',
    'pet.delete_confirm_message':
      'Czy na pewno chcesz usunąć to zwierzę? Tej operacji nie można cofnąć.',
    'pet.no_owner': 'Brak właściciela',
    'pet.add_visit': 'Dodaj wizytę',
    'pet.add_visit_description':
      'Dodaj nowy wpis do historii wizyt tego zwierzaka.',
    'pet.visit_date': 'Data wizyty',
    'pet.visit_notes': 'Notatki z wizyty',
    'pet.visit_notes_placeholder':
      'Wprowadź szczegóły wizyty (wykonane usługi, obserwacje, itp.)',
    'pet.notes_char_limit': 'Maksymalnie 2000 znaków',
    'pet.adding_visit': 'Dodawanie...',
    'pet.no_visits': 'Brak zapisanych wizyt',
    'pet.no_visits_description':
      'Dodaj pierwszą wizytę, aby rozpocząć śledzenie historii pielęgnacji tego zwierzaka.',
    'pet.visit_added_on': 'Dodano',
    'pet.delete_visit_confirm':
      'Czy na pewno chcesz usunąć tę wizytę? Tej operacji nie można cofnąć.',
    'pet.loading_visits': 'Ładowanie wizyt...',

    // Photos
    'pet.add_photos': 'Dodaj zdjęcia',
    'pet.add_photos_description': 'Dodaj zdjęcia dokumentujące tę wizytę.',
    'pet.visit_created_successfully':
      'Wizyta została utworzona! Możesz teraz dodać zdjęcia.',
    'pet.finish_adding_photos': 'Zakończ',
    'pet.drag_photos_or_click':
      'Przeciągnij zdjęcia tutaj lub kliknij aby wybrać',
    'pet.drop_photos_here': 'Upuść zdjęcia tutaj',
    'pet.photo_requirements': 'JPEG, PNG, WebP do 10MB każde',
    'pet.photos_remaining': 'Pozostało {count} zdjęć',
    'pet.max_photos_reached': 'Maksymalnie {max} zdjęć dozwolone',
    'pet.too_many_photos': 'Można dodać jeszcze tylko {max} zdjęć',
    'pet.max_photos_reached_message':
      'Osiągnięto maksymalną liczbę {max} zdjęć na wizytę.',
    'pet.uploading_photos': 'Przesyłanie zdjęć...',
    'pet.no_photos': 'Brak zdjęć z tej wizyty',
    'pet.photos_count': '{count} zdjęcie',
    'pet.photos_count_plural': '{count} zdjęć',
    'pet.delete_photo_confirm':
      'Czy na pewno chcesz usunąć to zdjęcie? Tej operacji nie można cofnąć.',
    'pet.lightbox_controls': 'Użyj strzałek do nawigacji, ESC aby zamknąć',
    download: 'Pobierz',

    are_you_sure: 'Czy na pewno?',
    delete: 'Usuń',
    actions: 'Akcje',
    pets: 'Zwierzęta',

    // Pets
    'pets.title': 'Zwierzęta',
    'pets.search_placeholder': 'Szukaj po imieniu zwierzaka...',
    'pets.name': 'Imię',
    'pets.breed': 'Rasa',
    'pets.age': 'Wiek',
    'pets.owner': 'Właściciel',
    view: 'Zobacz',
  },
};

export type Translation = typeof translations.en;

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: translations.en,
    },
    pl: {
      translation: translations.pl,
    },
  },
  lng: 'en', // Język domyślny
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

export type Language = 'en' | 'pl';
export type TranslationKey = keyof typeof translations.en;
