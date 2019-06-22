import { HttpService } from './http/http.service';
import { ServerHandlerService } from './server-handler/server-handler.service';
import { PostService } from './post-service/post-service.service';
import { AlertService, UserService, AuthenticationService} from './user-service';

export const servicesArray = [
   HttpService,
   ServerHandlerService,
   PostService,
   UserService,
   AuthenticationService,
   AlertService
];
