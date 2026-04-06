import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { IGetRequest } from './interfaces/get_request.interface';
import { IPostRequest } from './interfaces/post_request.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HttpRequestsUtil {
  constructor(private httpService: HttpService) {}

  handleHttpRequestError(error: any) {
    console.log(error);

    if (error.response) {
      console.log(
        `HTTP request error message: ${error.response.data.message} `,
      );
      throw new Error(error.response.data.message);
    }

    throw new Error(error.message);
  }

  async getRequest(data: IGetRequest) {
    try {
      const { url, headers } = data;
      const response = await firstValueFrom(
        this.httpService.get(url, { headers }),
      );

      if (!response) {
        throw new Error('Sorry, request could not be completed.');
      }

      return response;
    } catch (error) {
      console.log(`Http request to ${data.url} failed.`);
      this.handleHttpRequestError(error);
    }
  }

  async postRequest(data: IPostRequest) {
    try {
      const { url, payload, headers } = data;

      const response = await firstValueFrom(
        this.httpService.post(url, payload, { headers }),
      );

      if (!response) {
        console.log(`Request could not be completed to ${data.url} ...`);
        return false;
      }

      return response.data;
    } catch (error) {
      console.log(`Http request to ${data.url} failed..`);
      this.handleHttpRequestError(error);
    }
  }
}
