import { Request } from './type';
declare const FileUtil: {
    readTemporary: <T = any>(request: Request) => void | T;
    saveTemporary: (request: Request, data: any) => void;
};
export default FileUtil;
