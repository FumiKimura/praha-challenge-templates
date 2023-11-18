import axios from 'axios';
import { sumOfArray, asyncSumOfArray, asyncSumOfArraySometimesZero, getFirstNameThrowIfLong, } from "../functions";
import { NameApiService } from "../nameApiService";
import { DatabaseMock } from "../util/index";

jest.mock('../util/index');
jest.mock('axios')

// todo: ここに単体テストを書いてみましょう！
describe('sum of array tests', () => {
    test('adds [1, 2, 3] is 6', () => {
        const array = [1, 2, 3];
        expect(sumOfArray(array)).toEqual(6);
    });

    test('empty array should return 0', () => {
        const array:number[] = [];
        expect(sumOfArray(array)).toEqual(0);
    });
});

describe('async sum of array test', () => {
    test('adds [1, 2, 3] is 6', async () => {
        const array = [1, 2, 3];
        const response = await asyncSumOfArray(array);
        expect(response).toBe(6);
    });

    test('empty array should return 0', async () => {
        const array:number[] = [];
        await expect(asyncSumOfArray(array)).resolves.toEqual(0);
    });
});

describe('async sum of array sometimes zero', () => {
    const databaseMock = DatabaseMock as jest.Mock<DatabaseMock>;

    test('adds [1, 2, 3] is 6', async () => {
        const array:number[] = [1, 2, 3];
        databaseMock.mockImplementationOnce(() => {
            return {
                save: (_:number[]): void => {}
            }
        })
        const database = new DatabaseMock();
        expect(DatabaseMock).toHaveBeenCalled();
        const response = await asyncSumOfArraySometimesZero(database, array);
        expect(response).toBe(6);
    });

    test('save function threw error', async () => {
        const array:number[] = [1, 2, 3];
        databaseMock.mockImplementationOnce(() => {
            return {
                save: (_:number[]): void => {
                    throw 'fail!'
                }
            }
        })
        const database = new DatabaseMock();
        expect(DatabaseMock).toHaveBeenCalled();
        const response = await asyncSumOfArraySometimesZero(database, array);
        expect(response).toBe(0);
    });

    test('empty array fails with error', async () => {
        const array:number[] = [];
        await expect(asyncSumOfArraySometimesZero(new DatabaseMock, array)).resolves.toBe(0);
    });
});

describe('get firstname throw if long', () => {
    test('firstName length is less maxNameLength', async () => {
        const maxNameLength = 4;
        const nameApiService = new NameApiService();
        const spy = jest.spyOn(nameApiService, 'getFirstName').mockResolvedValue('Sam');
        const result = await getFirstNameThrowIfLong(nameApiService, maxNameLength);
        expect(spy).toHaveBeenCalled();
        expect(result).toBe('Sam');
        spy.mockRestore();
    });

    test('firstName length is same as maxNameLength', async () => {
        const maxNameLength = 4;
        const nameApiService = new NameApiService();
        const spy = jest.spyOn(nameApiService, 'getFirstName').mockResolvedValue('John');
        const result = await getFirstNameThrowIfLong(nameApiService, maxNameLength);
        expect(spy).toHaveBeenCalled();
        expect(result).toBe('John');
        spy.mockRestore();
    });

    test('firstName length is same as maxNameLength', async () => {
        const maxNameLength = 4;
        const nameApiService = new NameApiService();
        const spy = jest.spyOn(nameApiService, 'getFirstName').mockResolvedValue('Steve');
        await expect(getFirstNameThrowIfLong(nameApiService, maxNameLength)).rejects.toThrow();
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
    });
});

describe('test nameApiService', () => {
    test('firstName length is less than maxNameLength', async ()=>{
        const maxNameLength = 4;
        const mockedAxios = axios as jest.Mocked<typeof axios>;
        mockedAxios.get.mockResolvedValue({data:{first_name: "Sam"}});
        const nameApiService = new NameApiService();
        await expect(nameApiService.getFirstName(maxNameLength)).resolves.toBe("Sam");
        expect(mockedAxios.get).toHaveBeenCalled();
    });

    test('firstName length is equal to maxNameLength', async ()=>{
        const maxNameLength = 4;
        const mockedAxios = axios as jest.Mocked<typeof axios>;
        mockedAxios.get.mockResolvedValue({data:{first_name: "John"}});
        const nameApiService = new NameApiService();
        await expect(nameApiService.getFirstName(maxNameLength)).resolves.toBe("John");
        expect(mockedAxios.get).toHaveBeenCalled();
    });

    test('firstName length is greater to maxNameLength', async ()=>{
        const maxNameLength = 4;
        const mockedAxios = axios as jest.Mocked<typeof axios>;
        mockedAxios.get.mockResolvedValue({data:{first_name: "Steve"}});
        const nameApiService = new NameApiService();
        await expect(nameApiService.getFirstName(maxNameLength)).rejects.toThrow();
        expect(mockedAxios.get).toHaveBeenCalled();
    });
});