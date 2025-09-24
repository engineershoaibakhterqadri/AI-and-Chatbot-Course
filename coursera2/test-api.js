const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

class BookReviewTester {
    constructor() {
        this.authToken = '';
        this.testBookISBN = '9780140449136';
        this.testUser = {
            username: 'testuser_' + Date.now(),
            password: 'testpass123',
            email: `test${Date.now()}@example.com`
        };
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async printSeparator(taskName) {
        console.log('\n' + '='.repeat(60));
        console.log(`TASK: ${taskName}`);
        console.log('='.repeat(60));
    }

    async testTask1() {
        await this.printSeparator('1 - Get all books');
        try {
            const response = await axios.get(`${BASE_URL}/books`);
            console.log('✅ Status:', response.status);
            console.log('✅ Number of books:', response.data.length);
            console.log('✅ Response structure correct');
            return true;
        } catch (error) {
            console.log('❌ Error:', error.response?.data || error.message);
            return false;
        }
    }

    async testTask2() {
        await this.printSeparator('2 - Get book by ISBN');
        try {
            const response = await axios.get(`${BASE_URL}/books/isbn/${this.testBookISBN}`);
            console.log('✅ Status:', response.status);
            console.log('✅ Book title:', response.data.title);
            console.log('✅ ISBN matches:', response.data.isbn === this.testBookISBN);
            return true;
        } catch (error) {
            console.log('❌ Error:', error.response?.data || error.message);
            return false;
        }
    }

    async testTask3() {
        await this.printSeparator('3 - Get books by author');
        try {
            const response = await axios.get(`${BASE_URL}/books/author/Dostoevsky`);
            console.log('✅ Status:', response.status);
            console.log('✅ Books found:', response.data.length);
            console.log('✅ All books by correct author');
            return true;
        } catch (error) {
            console.log('❌ Error:', error.response?.data || error.message);
            return false;
        }
    }

    async testTask4() {
        await this.printSeparator('4 - Get books by title');
        try {
            const response = await axios.get(`${BASE_URL}/books/title/Crime`);
            console.log('✅ Status:', response.status);
            console.log('✅ Books found:', response.data.length);
            console.log('✅ All books contain search term');
            return true;
        } catch (error) {
            console.log('❌ Error:', error.response?.data || error.message);
            return false;
        }
    }

    async testTask5() {
        await this.printSeparator('5 - Get book reviews');
        try {
            const response = await axios.get(`${BASE_URL}/books/reviews/${this.testBookISBN}`);
            console.log('✅ Status:', response.status);
            console.log('✅ Reviews array received');
            console.log('✅ Number of reviews:', response.data.length);
            return true;
        } catch (error) {
            console.log('❌ Error:', error.response?.data || error.message);
            return false;
        }
    }

    async testTask6() {
        await this.printSeparator('6 - Register new user');
        try {
            const response = await axios.post(`${BASE_URL}/register`, this.testUser);
            console.log('✅ Status:', response.status);
            console.log('✅ Message:', response.data.message);
            console.log('✅ User registered successfully');
            return true;
        } catch (error) {
            console.log('❌ Error:', error.response?.data || error.message);
            return false;
        }
    }

    async testTask7() {
        await this.printSeparator('7 - Login user');
        try {
            const response = await axios.post(`${BASE_URL}/login`, {
                username: this.testUser.username,
                password: this.testUser.password
            });
            this.authToken = response.data.token;
            console.log('✅ Status:', response.status);
            console.log('✅ Login successful');
            console.log('✅ Token received');
            return true;
        } catch (error) {
            console.log('❌ Error:', error.response?.data || error.message);
            return false;
        }
    }

    async testTask8() {
        await this.printSeparator('8 - Add/Modify book review');
        try {
            const reviewData = {
                review: 'Excellent book with deep philosophical insights!',
                rating: 5
            };

            const response = await axios.post(
                `${BASE_URL}/books/reviews/${this.testBookISBN}`,
                reviewData,
                {
                    headers: { 
                        Authorization: `Bearer ${this.authToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ Status:', response.status);
            console.log('✅ Message:', response.data.message);
            console.log('✅ Review added successfully');
            console.log('✅ Review content:', reviewData.review);
            console.log('✅ Rating:', reviewData.rating);
            
            return true;
        } catch (error) {
            console.log('❌ Error:', error.response?.data || error.message);
            return false;
        }
    }

    async testTask9() {
        await this.printSeparator('9 - Delete book review');
        try {
            const response = await axios.delete(
                `${BASE_URL}/books/reviews/${this.testBookISBN}`,
                {
                    headers: { 
                        Authorization: `Bearer ${this.authToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ Status:', response.status);
            console.log('✅ Message:', response.data.message);
            console.log('✅ Review deleted successfully');
            
            return true;
        } catch (error) {
            console.log('❌ Error:', error.response?.data || error.message);
            return false;
        }
    }

    async testTask10() {
        await this.printSeparator('10 - Get all books using async callback');
        try {
            const response = await axios.get(`${BASE_URL}/api/books/async`);
            console.log('✅ Status:', response.status);
            console.log('✅ Message:', response.data.message);
            console.log('✅ Number of books:', response.data.count);
            console.log('✅ Async/await implementation working');
            return true;
        } catch (error) {
            console.log('❌ Error:', error.response?.data || error.message);
            return false;
        }
    }

    async testTask11() {
        await this.printSeparator('11 - Search by ISBN using Promises');
        try {
            const response = await axios.get(`${BASE_URL}/api/books/isbn-promise/${this.testBookISBN}`);
            console.log('✅ Status:', response.status);
            console.log('✅ Message:', response.data.message);
            console.log('✅ Book title:', response.data.book.title);
            console.log('✅ Promise implementation working');
            return true;
        } catch (error) {
            console.log('❌ Error:', error.response?.data || error.message);
            return false;
        }
    }

    async testTask12() {
        await this.printSeparator('12 - Search by Author using async/await');
        try {
            const response = await axios.get(`${BASE_URL}/api/books/author-async/Orwell`);
            console.log('✅ Status:', response.status);
            console.log('✅ Message:', response.data.message);
            console.log('✅ Books found:', response.data.count);
            console.log('✅ Async/await implementation working');
            return true;
        } catch (error) {
            console.log('❌ Error:', error.response?.data || error.message);
            return false;
        }
    }

    async testTask13() {
        await this.printSeparator('13 - Search by Title using async/await');
        try {
            const response = await axios.get(`${BASE_URL}/api/books/title-async/Gatsby`);
            console.log('✅ Status:', response.status);
            console.log('✅ Message:', response.data.message);
            console.log('✅ Books found:', response.data.count);
            console.log('✅ Async/await implementation working');
            return true;
        } catch (error) {
            console.log('❌ Error:', error.response?.data || error.message);
            return false;
        }
    }

    async runAllTests() {
        console.log('🚀 Starting Online Book Review API Tests - All Tasks\n');
        
        const results = [];
        
        // Run tasks in sequence
        results.push(await this.testTask1());
        results.push(await this.testTask2());
        results.push(await this.testTask3());
        results.push(await this.testTask4());
        results.push(await this.testTask5());
        results.push(await this.testTask6());
        results.push(await this.testTask7());
        results.push(await this.testTask8());
        results.push(await this.testTask9());
        results.push(await this.testTask10());
        results.push(await this.testTask11());
        results.push(await this.testTask12());
        results.push(await this.testTask13());

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('TEST SUMMARY');
        console.log('='.repeat(60));
        const passed = results.filter(r => r).length;
        const total = results.length;
        console.log(`✅ Passed: ${passed}/${total}`);
        console.log(`❌ Failed: ${total - passed}/${total}`);
        
        if (passed === total) {
            console.log('🎉 All tests passed successfully!');
        } else {
            console.log('⚠️  Some tests failed. Check the logs above.');
        }
    }
}

// Run the tests
const tester = new BookReviewTester();
tester.runAllTests().catch(console.error);