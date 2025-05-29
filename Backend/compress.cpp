#include <iostream>
#include <fstream>
#include <queue>
#include <unordered_map>
#include <vector>
#include <bitset>
#include <string>

using namespace std;

// Node of Huffman Tree
struct Node {
    char ch;
    int freq;
    Node *left, *right;
    Node(char c, int f) : ch(c), freq(f), left(nullptr), right(nullptr) {}
    Node(Node* l, Node* r) : ch('\0'), freq(l->freq + r->freq), left(l), right(r) {}
};

// Comparison for priority queue (min-heap)
struct Compare {
    bool operator()(Node* l, Node* r) {
        return l->freq > r->freq;
    }
};

// Build Huffman tree from frequency map
Node* buildTree(unordered_map<char, int>& freqMap) {
    priority_queue<Node*, vector<Node*>, Compare> pq;
    for (auto& p : freqMap) {
        pq.push(new Node(p.first, p.second));
    }

    while (pq.size() > 1) {
        Node* left = pq.top(); pq.pop();
        Node* right = pq.top(); pq.pop();
        pq.push(new Node(left, right));
    }
    return pq.top();
}

// Generate Huffman codes recursively
void generateCodes(Node* root, unordered_map<char, string>& codes, string code = "") {
    if (!root) return;
    if (!root->left && !root->right) {  // leaf
        codes[root->ch] = code;
    }
    generateCodes(root->left, codes, code + "0");
    generateCodes(root->right, codes, code + "1");
}

// Serialize tree to file (preorder traversal)
void serializeTree(Node* root, ofstream& out) {
    if (!root) {
        out.put('#');  // marker for null
        return;
    }
    if (!root->left && !root->right) {
        out.put('L');   // leaf marker
        out.put(root->ch);
    } else {
        out.put('I');   // internal node marker
        serializeTree(root->left, out);
        serializeTree(root->right, out);
    }
}

// Deserialize tree from file
Node* deserializeTree(ifstream& in) {
    char c;
    if (!in.get(c)) return nullptr;
    if (c == '#') return nullptr;
    if (c == 'L') {
        char ch;
        in.get(ch);
        return new Node(ch, 0);
    }
    if (c == 'I') {
        Node* left = deserializeTree(in);
        Node* right = deserializeTree(in);
        return new Node(left, right);
    }
    return nullptr;  // error
}

// Write bits to output stream (buffered)
void writeBits(ofstream& out, const string& bits, int& bitCount, unsigned char& buffer) {
    for (char b : bits) {
        buffer = (buffer << 1) | (b == '1' ? 1 : 0);
        bitCount++;
        if (bitCount == 8) {
            out.put(buffer);
            bitCount = 0;
            buffer = 0;
        }
    }
}

// Flush remaining bits padded with 0s
void flushBits(ofstream& out, int& bitCount, unsigned char& buffer) {
    if (bitCount > 0) {
        buffer = buffer << (8 - bitCount);
        out.put(buffer);
        bitCount = 0;
        buffer = 0;
    }
}

// Read one bit at a time from input stream
bool readBit(ifstream& in, int& bitCount, unsigned char& buffer, bool& eof) {
    if (bitCount == 0) {
        if (!in.get((char&)buffer)) {
            eof = true;
            return 0;
        }
        bitCount = 8;
    }
    bool bit = (buffer & 0x80) != 0;
    buffer <<= 1;
    bitCount--;
    return bit;
}

// Compress function
void compress(const string& inputFile, const string& outputFile) {
    ifstream in(inputFile, ios::binary);
    if (!in.is_open()) {
        cerr << "Cannot open input file.\n";
        exit(1);
    }

    unordered_map<char, int> freqMap;
    char ch;
    while (in.get(ch)) {
        freqMap[ch]++;
    }
    if (freqMap.empty()) {
        cerr << "Input file is empty.\n";
        exit(1);
    }

    // Build tree
    Node* root = buildTree(freqMap);

    // Generate codes
    unordered_map<char, string> codes;
    generateCodes(root, codes);

    in.clear();
    in.seekg(0);

    ofstream out(outputFile, ios::binary);
    if (!out.is_open()) {
        cerr << "Cannot open output file.\n";
        exit(1);
    }

    // Serialize tree first (needed for decompression)
    serializeTree(root, out);

    // Write compressed data bits
    int bitCount = 0;
    unsigned char buffer = 0;
    while (in.get(ch)) {
        writeBits(out, codes[ch], bitCount, buffer);
    }
    flushBits(out, bitCount, buffer);

    cout << "Compression done.\n";

    in.close();
    out.close();
}

// Decompress function
void decompress(const string& inputFile, const string& outputFile) {
    ifstream in(inputFile, ios::binary);
    if (!in.is_open()) {
        cerr << "Cannot open input file.\n";
        exit(1);
    }

    // Deserialize Huffman tree
    Node* root = deserializeTree(in);
    if (!root) {
        cerr << "Failed to read Huffman tree.\n";
        exit(1);
    }

    ofstream out(outputFile, ios::binary);
    if (!out.is_open()) {
        cerr << "Cannot open output file.\n";
        exit(1);
    }

    Node* current = root;
    int bitCount = 0;
    unsigned char buffer = 0;
    bool eof = false;

    while (!eof) {
        bool bit = readBit(in, bitCount, buffer, eof);
        if (eof) break;

        if (bit) current = current->right;
        else current = current->left;

        if (!current->left && !current->right) {
            out.put(current->ch);
            current = root;
        }
    }

    cout << "Decompression done.\n";

    in.close();
    out.close();
}

// Free tree memory
void freeTree(Node* root) {
    if (!root) return;
    freeTree(root->left);
    freeTree(root->right);
    delete root;
}

int main(int argc, char* argv[]) {
    if (argc != 4) {
        cerr << "Usage: " << argv[0] << " <compress|decompress> <inputfile> <outputfile>\n";
        return 1;
    }

    string mode = argv[1];
    string inputFile = argv[2];
    string outputFile = argv[3];

    if (mode == "compress") {
        compress(inputFile, outputFile);
    } else if (mode == "decompress") {
        decompress(inputFile, outputFile);
    } else {
        cerr << "Unknown mode: " << mode << "\n";
        return 1;
    }

    return 0;
}
