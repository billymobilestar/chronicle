import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class ChronicleTheme {
  // Colors
  static const Color cobalt = Color(0xFF0A1A3F);
  static const Color cobaltLight = Color(0xFF0F2251);
  static const Color cobaltDark = Color(0xFF060E22);
  static const Color frenchBlue = Color(0xFF1E3566);
  static const Color wisteria = Color(0xFF7B8FAD);
  static const Color paleSky = Color(0xFFD0D6DF);
  static const Color cream = Color(0xFFF0EDE6);
  static const Color offwhite = Color(0xFFF7F6F3);
  static const Color accent = Color(0xFF6D3AC8);
  static const Color accentHover = Color(0xFF5B2EA8);
  static const Color accentGlow = Color(0xFF8B5CF6);
  static const Color neon = Color(0xFFC4FF6B);

  static ThemeData get theme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: offwhite,
      colorScheme: ColorScheme.light(
        primary: cobalt,
        secondary: accent,
        surface: Colors.white,
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onSurface: cobalt,
      ),
      textTheme: GoogleFonts.spaceGroteskTextTheme().copyWith(
        displayLarge: GoogleFonts.syne(
          fontWeight: FontWeight.w800,
          color: cobalt,
          letterSpacing: -1,
        ),
        displayMedium: GoogleFonts.syne(
          fontWeight: FontWeight.w800,
          color: cobalt,
          letterSpacing: -0.5,
        ),
        displaySmall: GoogleFonts.syne(
          fontWeight: FontWeight.w800,
          color: cobalt,
        ),
        headlineMedium: GoogleFonts.syne(
          fontWeight: FontWeight.w700,
          color: cobalt,
        ),
        titleLarge: GoogleFonts.syne(
          fontWeight: FontWeight.w700,
          color: cobalt,
          letterSpacing: 1.5,
        ),
        bodyLarge: GoogleFonts.spaceGrotesk(color: cobalt),
        bodyMedium: GoogleFonts.spaceGrotesk(color: cobalt),
        bodySmall: GoogleFonts.spaceGrotesk(color: wisteria),
        labelLarge: GoogleFonts.syne(
          fontWeight: FontWeight.w700,
          letterSpacing: 2,
          fontSize: 12,
        ),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: offwhite,
        foregroundColor: cobalt,
        elevation: 0,
        scrolledUnderElevation: 1,
        centerTitle: false,
        titleTextStyle: GoogleFonts.syne(
          fontWeight: FontWeight.w800,
          fontSize: 18,
          color: cobalt,
          letterSpacing: 1.5,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: cobalt,
          foregroundColor: Colors.white,
          shape: const StadiumBorder(),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          textStyle: GoogleFonts.syne(
            fontWeight: FontWeight.w700,
            fontSize: 13,
            letterSpacing: 1.5,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: cobalt,
          side: const BorderSide(color: cobalt, width: 2),
          shape: const StadiumBorder(),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          textStyle: GoogleFonts.syne(
            fontWeight: FontWeight.w700,
            fontSize: 13,
            letterSpacing: 1.5,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: cobalt.withValues(alpha: 0.1), width: 2),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: cobalt.withValues(alpha: 0.1), width: 2),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: accent, width: 2),
        ),
        labelStyle: GoogleFonts.syne(
          fontWeight: FontWeight.w700,
          fontSize: 10,
          letterSpacing: 2,
          color: wisteria,
        ),
      ),
      cardTheme: CardThemeData(
        color: Colors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
          side: BorderSide(color: cobalt.withValues(alpha: 0.05), width: 2),
        ),
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: Colors.white,
        selectedItemColor: accent,
        unselectedItemColor: wisteria,
        selectedLabelStyle: GoogleFonts.syne(
          fontWeight: FontWeight.w700,
          fontSize: 10,
          letterSpacing: 1,
        ),
        unselectedLabelStyle: GoogleFonts.syne(
          fontWeight: FontWeight.w600,
          fontSize: 10,
          letterSpacing: 1,
        ),
        type: BottomNavigationBarType.fixed,
      ),
    );
  }
}
