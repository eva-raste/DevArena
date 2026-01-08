//package com.devarena.helper;
//
//import java.util.regex.Matcher;
//import java.util.regex.Pattern;
//
//public final class CodeforcesSlugNormalizer {
//
//    private CodeforcesSlugNormalizer() {}
//
//    // matches: /problem/852/A
//    private static final Pattern URL_PATTERN =
//            Pattern.compile(".*/problem/(\\d+)/([A-Za-z]).*");
//
//    // matches: 852/A or 852/a
//    private static final Pattern SLASH_PATTERN =
//            Pattern.compile("^(\\d+)/([A-Za-z])$");
//
//    // matches: 852A or 852a
//    private static final Pattern COMPACT_PATTERN =
//            Pattern.compile("^(\\d+)([A-Za-z])$");
//
//    public static String normalize(String input) {
//        if (input == null) {
//            throw new IllegalArgumentException("Slug cannot be null");
//        }
//
//        String s = input.trim();
//
//        if (s.isEmpty()) {
//            throw new IllegalArgumentException("Slug cannot be empty");
//        }
//
//        Matcher url = URL_PATTERN.matcher(s);
//        if (url.matches()) {
//            return canonical(url.group(1), url.group(2));
//        }
//
//        Matcher slash = SLASH_PATTERN.matcher(s);
//        if (slash.matches()) {
//            return canonical(slash.group(1), slash.group(2));
//        }
//
//        Matcher compact = COMPACT_PATTERN.matcher(s);
//        if (compact.matches()) {
//            return canonical(compact.group(1), compact.group(2));
//        }
//
//        throw new IllegalArgumentException(
//                "Invalid Codeforces problem reference"
//        );
//    }
//
//    private static String canonical(String id, String index) {
//        return id + "/" + index.toLowerCase();
//    }
//}
//
