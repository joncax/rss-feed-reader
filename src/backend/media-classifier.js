/**
 * MediaClassifier — Auto-detect media type baseado no título
 */

class MediaClassifier {
  constructor() {
    // Padrões para TV
    this.tvPatterns = [
      /s\d{1,2}e\d{1,2}/i,           // S01E01, s02e03
      /season\s*\d+/i,                // Season 01, season 02
      /\bepisode\s*\d+/i,             // Episode 01
      /\btvshow\b/i,                  // tvshow
      /\b(the|a)\s+.*\s+(season|series)/i  // The Office Season
    ];

    // Padrões para Music
    this.musicPatterns = [
      /\.(mp3|flac|wav|aac|m4a)$/i,   // Extensões de áudio
      /\balbum\b/i,                   // album
      /\bartist\b/i,                  // artist
      /\b(track|song)\s*\d+/i,        // Track 01, Song 01
      /\b(feat\.|featuring|ft\.)\b/i  // Colaborações
    ];

    // Padrões para Movie
    this.moviePatterns = [
      /\b(dvdrip|bdrip|webrip|hdtv|bluray)\b/i,
      /\b(1080p|720p|480p|2160p)\b/i,
      /\b(h\.?264|h\.?265|x264|x265)\b/i,
      /\b(aac|ac3|dts)\b/i,
      /\(20\d{2}\)/,                  // Ano: (2023), (2024)
      /\[.*?dub.*?\]/i                // [DUB], [Dubbed]
    ];
  }

  /**
   * Classificar media baseado no título
   * Returns: { type: 'tv'|'movie'|'music'|'unknown', category: 'TV_Series'|'01-FILMES'|'04-MP3' }
   */
  classify(title) {
    if (!title || typeof title !== 'string') {
      return { type: 'unknown', category: '01-FILMES' };
    }

    const lowerTitle = title.toLowerCase();

    // Verificar TV primeiro (mais específico)
    for (const pattern of this.tvPatterns) {
      if (pattern.test(lowerTitle)) {
        return {
          type: 'tv',
          category: 'tv'
        };
      }
    }

    // Verificar Music
    for (const pattern of this.musicPatterns) {
      if (pattern.test(lowerTitle)) {
        return {
          type: 'music',
          category: 'music'
        };
      }
    }

    // Verificar Movie
    for (const pattern of this.moviePatterns) {
      if (pattern.test(lowerTitle)) {
        return {
          type: 'movie',
          category: 'movies'
        };
      }
    }

    // Default: Movie
    return {
      type: 'movie',
      category: 'movies'
    };
  }

  /**
   * Testar classificação (para debug)
   */
  test(titles) {
    console.log('\n📊 Media Classification Test:\n');
    titles.forEach(title => {
      const result = this.classify(title);
      console.log(`"${title}"`);
      console.log(`  → Type: ${result.type}, Category: ${result.category}\n`);
    });
  }
}

export default new MediaClassifier();