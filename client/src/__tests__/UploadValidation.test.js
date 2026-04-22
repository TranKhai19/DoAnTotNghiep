import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Component giả lập Logic Upload File
const UploaderMock = () => {
    const [error, setError] = React.useState('');
    const [files, setFiles] = React.useState([]);

    const handleUpload = (e) => {
        const fileList = Array.from(e.target.files);
        if (fileList.length === 0) return;

        setError(''); // Reset error
        
        for (let file of fileList) {
            // Validate Dung lượng trống (0KB)
            if (file.size === 0) {
                setError('File rỗng không hợp lệ');
                return;
            }
            // Validate Dung lượng (5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('File quá lớn');
                return;
            }
            // Validate Format
            if (!file.type.startsWith('image/')) {
                setError('Format bị từ chối');
                return;
            }
            // File trùng lặp
            if (files.find(f => f.name === file.name)) {
                setError('Cảnh báo file trùng lặp');
                // Hoặc bỏ qua chặn return tùy business. Ở đây ta văng lỗi cảnh báo
                return;
            }
        }
        setFiles(prev => [...prev, ...fileList]);
    };

    const handleCancel = () => {
        setFiles([]);
        setError('');
    };

    const handleDrop = (e) => {
        e.preventDefault();
        handleUpload({ target: { files: e.dataTransfer.files } });
    };

    return (
        <div 
            data-testid="drop-zone" 
            onDrop={handleDrop} 
            onDragOver={(e) => e.preventDefault()}
        >
            <input data-testid="upload-input" type="file" multiple onChange={handleUpload} />
            <button data-testid="btn-cancel" onClick={handleCancel}>Hủy</button>
            <div data-testid="error-message">{error}</div>
            <div data-testid="file-list">
                {files.map((f, i) => <span key={i}>{f.name}</span>)}
            </div>
        </div>
    );
};

describe('UP: Kiểm thử tính năng Upload File', () => {

    let fileInput, dropZone, errorMessage, fileList, btnCancel;

    beforeEach(() => {
        render(<UploaderMock />);
        fileInput = screen.getByTestId('upload-input');
        dropZone = screen.getByTestId('drop-zone');
        errorMessage = screen.getByTestId('error-message');
        fileList = screen.getByTestId('file-list');
        btnCancel = screen.getByTestId('btn-cancel');
    });

    const createMockFile = (name, type, size) => {
        const file = new File(['mock content'], name, { type });
        Object.defineProperty(file, 'size', { value: size });
        return file;
    };

    test('UP01: File lớn hơn 5MB -> Bị từ chối', () => {
        const largeFile = createMockFile('large.jpg', 'image/jpeg', 6 * 1024 * 1024);
        fireEvent.change(fileInput, { target: { files: [largeFile] } });
        expect(errorMessage).toHaveTextContent('File quá lớn');
    });

    test('UP02 & UP03: Tải lên file .exe và .txt -> Format bị từ chối', () => {
        const exeFile = createMockFile('virus.exe', 'application/x-msdownload', 1024);
        fireEvent.change(fileInput, { target: { files: [exeFile] } });
        expect(errorMessage).toHaveTextContent('Format bị từ chối');

        const txtFile = createMockFile('document.txt', 'text/plain', 1024);
        fireEvent.change(fileInput, { target: { files: [txtFile] } });
        expect(errorMessage).toHaveTextContent('Format bị từ chối');
    });

    test('UP04: Tải lên nhiều file (Multi files) < 5MB -> Thành công', () => {
        const file1 = createMockFile('1.jpg', 'image/jpeg', 1024);
        const file2 = createMockFile('2.png', 'image/png', 2048);
        
        fireEvent.change(fileInput, { target: { files: [file1, file2] } });
        expect(errorMessage).toBeEmptyDOMElement();
        expect(fileList.children.length).toBe(2);
    });

    test('UP05: File rỗng 0KB -> Báo lỗi', () => {
        const emptyFile = createMockFile('empty.jpg', 'image/jpeg', 0);
        fireEvent.change(fileInput, { target: { files: [emptyFile] } });
        expect(errorMessage).toHaveTextContent('File rỗng không hợp lệ');
    });

    test('UP06: Tải lên file Hợp lệ -> Thành công', () => {
        const validFile = createMockFile('valid.jpg', 'image/jpeg', 1 * 1024 * 1024);
        fireEvent.change(fileInput, { target: { files: [validFile] } });
        expect(fileList).toHaveTextContent('valid.jpg');
    });

    test('UP07: Thao tác Kéo thả (Drag-drop) -> Thành công', () => {
        const validFile = createMockFile('dragged.jpg', 'image/jpeg', 1024);
        fireEvent.drop(dropZone, { dataTransfer: { files: [validFile] } });
        expect(fileList).toHaveTextContent('dragged.jpg');
    });

    test('UP08: Hủy upload (Cancel) -> Dọn dẹp state', () => {
        const validFile = createMockFile('temp.jpg', 'image/jpeg', 1024);
        fireEvent.change(fileInput, { target: { files: [validFile] } });
        expect(fileList).toHaveTextContent('temp.jpg');

        fireEvent.click(btnCancel);
        expect(fileList).toBeEmptyDOMElement();
    });

    test('UP09: Duplicate (Cảnh báo file trùng)', () => {
        const validFile = createMockFile('duplicate.jpg', 'image/jpeg', 1024);
        // Lần 1
        fireEvent.change(fileInput, { target: { files: [validFile] } });
        // Lần 2 trùng tên
        fireEvent.change(fileInput, { target: { files: [validFile] } });
        
        expect(errorMessage).toHaveTextContent('Cảnh báo file trùng lặp');
    });
});
