#!/usr/bin/env python3
import re

def simplify_role(role):
    """Simplify role titles by removing location-specific parts."""
    
    # More precise patterns to remove
    patterns_to_remove = [
        r'\s+of\s+(?:the\s+)?(?:United\s+Kingdom|UK|England|Scotland|Wales|Ireland|London|Manchester|Birmingham|Liverpool|Leeds|Sheffield|Bristol|Glasgow|Edinburgh|Cardiff|Belfast|New\s+York|America|USA|Canada|Australia|France|Germany|Italy|Spain|Russia|China|Japan|India|Brazil|Mexico|Argentina|South\s+Africa|Egypt|Nigeria|Kenya|Ghana|Morocco|Tunisia|Algeria|Libya|Sudan|Ethiopia|Somalia|Djibouti|Eritrea|Comoros|Mauritius|Seychelles|Madagascar|Malawi|Zambia|Zimbabwe|Botswana|Namibia|Angola|Mozambique|Tanzania|Uganda|Rwanda|Burundi|Central\s+African\s+Republic|Congo|Gabon|Equatorial\s+Guinea|Cameroon|Chad|Niger|Mali|Burkina\s+Faso|Senegal|Gambia|Guinea-Bissau|Guinea|Sierra\s+Leone|Liberia|Ivory\s+Coast|Togo|Benin|Cape\s+Verde|São\s+Tomé\s+and\s+Príncipe|Ghana|Morocco|Tunisia|Algeria|Libya|Sudan|Ethiopia|Somalia|Djibouti|Eritrea|Comoros|Mauritius|Seychelles|Madagascar|Malawi|Zambia|Zimbabwe|Botswana|Namibia|Angola|Mozambique|Tanzania|Uganda|Rwanda|Burundi|Central\s+African\s+Republic|Congo|Gabon|Equatorial\s+Guinea|Cameroon|Chad|Niger|Mali|Burkina\s+Faso|Senegal|Gambia|Guinea-Bissau|Guinea|Sierra\s+Leone|Liberia|Ivory\s+Coast|Togo|Benin|Cape\s+Verde|São\s+Tomé\s+and\s+Príncipe)(?:\s|$)',
        r'\s+in\s+(?:the\s+)?(?:United\s+Kingdom|UK|England|Scotland|Wales|Ireland|London|Manchester|Birmingham|Liverpool|Leeds|Sheffield|Bristol|Glasgow|Edinburgh|Cardiff|Belfast|New\s+York|America|USA|Canada|Australia|France|Germany|Italy|Spain|Russia|China|Japan|India|Brazil|Mexico|Argentina|South\s+Africa|Egypt|Nigeria|Kenya|Ghana|Morocco|Tunisia|Algeria|Libya|Sudan|Ethiopia|Somalia|Djibouti|Eritrea|Comoros|Mauritius|Seychelles|Madagascar|Malawi|Zambia|Zimbabwe|Botswana|Namibia|Angola|Mozambique|Tanzania|Uganda|Rwanda|Burundi|Central\s+African\s+Republic|Congo|Gabon|Equatorial\s+Guinea|Cameroon|Chad|Niger|Mali|Burkina\s+Faso|Senegal|Gambia|Guinea-Bissau|Guinea|Sierra\s+Leone|Liberia|Ivory\s+Coast|Togo|Benin|Cape\s+Verde|São\s+Tomé\s+and\s+Príncipe|Ghana|Morocco|Tunisia|Algeria|Libya|Sudan|Ethiopia|Somalia|Djibouti|Eritrea|Comoros|Mauritius|Seychelles|Madagascar|Malawi|Zambia|Zimbabwe|Botswana|Namibia|Angola|Mozambique|Tanzania|Uganda|Rwanda|Burundi|Central\s+African\s+Republic|Congo|Gabon|Equatorial\s+Guinea|Cameroon|Chad|Niger|Mali|Burkina\s+Faso|Senegal|Gambia|Guinea-Bissau|Guinea|Sierra\s+Leone|Liberia|Ivory\s+Coast|Togo|Benin|Cape\s+Verde|São\s+Tomé\s+and\s+Príncipe)(?:\s|$)',
        r'\s+for\s+(?:the\s+)?(?:United\s+Kingdom|UK|England|Scotland|Wales|Ireland|London|Manchester|Birmingham|Liverpool|Leeds|Sheffield|Bristol|Glasgow|Edinburgh|Cardiff|Belfast|New\s+York|America|USA|Canada|Australia|France|Germany|Italy|Spain|Russia|China|Japan|India|Brazil|Mexico|Argentina|South\s+Africa|Egypt|Nigeria|Kenya|Ghana|Morocco|Tunisia|Algeria|Libya|Sudan|Ethiopia|Somalia|Djibouti|Eritrea|Comoros|Mauritius|Seychelles|Madagascar|Malawi|Zambia|Zimbabwe|Botswana|Namibia|Angola|Mozambique|Tanzania|Uganda|Rwanda|Burundi|Central\s+African\s+Republic|Congo|Gabon|Equatorial\s+Guinea|Cameroon|Chad|Niger|Mali|Burkina\s+Faso|Senegal|Gambia|Guinea-Bissau|Guinea|Sierra\s+Leone|Liberia|Ivory\s+Coast|Togo|Benin|Cape\s+Verde|São\s+Tomé\s+and\s+Príncipe|Ghana|Morocco|Tunisia|Algeria|Libya|Sudan|Ethiopia|Somalia|Djibouti|Eritrea|Comoros|Mauritius|Seychelles|Madagascar|Malawi|Zambia|Zimbabwe|Botswana|Namibia|Angola|Mozambique|Tanzania|Uganda|Rwanda|Burundi|Central\s+African\s+Republic|Congo|Gabon|Equatorial\s+Guinea|Cameroon|Chad|Niger|Mali|Burkina\s+Faso|Senegal|Gambia|Guinea-Bissau|Guinea|Sierra\s+Leone|Liberia|Ivory\s+Coast|Togo|Benin|Cape\s+Verde|São\s+Tomé\s+and\s+Príncipe)(?:\s|$)',
        r'\s+at\s+(?:the\s+)?(?:United\s+Kingdom|UK|England|Scotland|Wales|Ireland|London|Manchester|Birmingham|Liverpool|Leeds|Sheffield|Bristol|Glasgow|Edinburgh|Cardiff|Belfast|New\s+York|America|USA|Canada|Australia|France|Germany|Italy|Spain|Russia|China|Japan|India|Brazil|Mexico|Argentina|South\s+Africa|Egypt|Nigeria|Kenya|Ghana|Morocco|Tunisia|Algeria|Libya|Sudan|Ethiopia|Somalia|Djibouti|Eritrea|Comoros|Mauritius|Seychelles|Madagascar|Malawi|Zambia|Zimbabwe|Botswana|Namibia|Angola|Mozambique|Tanzania|Uganda|Rwanda|Burundi|Central\s+African\s+Republic|Congo|Gabon|Equatorial\s+Guinea|Cameroon|Chad|Niger|Mali|Burkina\s+Faso|Senegal|Gambia|Guinea-Bissau|Guinea|Sierra\s+Leone|Liberia|Ivory\s+Coast|Togo|Benin|Cape\s+Verde|São\s+Tomé\s+and\s+Príncipe|Ghana|Morocco|Tunisia|Algeria|Libya|Sudan|Ethiopia|Somalia|Djibouti|Eritrea|Comoros|Mauritius|Seychelles|Madagascar|Malawi|Zambia|Zimbabwe|Botswana|Namibia|Angola|Mozambique|Tanzania|Uganda|Rwanda|Burundi|Central\s+African\s+Republic|Congo|Gabon|Equatorial\s+Guinea|Cameroon|Chad|Niger|Mali|Burkina\s+Faso|Senegal|Gambia|Guinea-Bissau|Guinea|Sierra\s+Leone|Liberia|Ivory\s+Coast|Togo|Benin|Cape\s+Verde|São\s+Tomé\s+and\s+Príncipe)(?:\s|$)',
    ]
    
    # Apply each pattern
    simplified = role
    for pattern in patterns_to_remove:
        simplified = re.sub(pattern, '', simplified, flags=re.IGNORECASE)
    
    # Clean up extra whitespace
    simplified = re.sub(r'\s+', ' ', simplified).strip()
    
    return simplified

def process_file(input_file, output_file):
    """Process the roles file and create a simplified version."""
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    simplified_lines = []
    for line in lines:
        line = line.strip()
        if line and not line.startswith('//') and not line.startswith('[') and not line.startswith('"'):
            simplified = simplify_role(line)
            if simplified != line:
                print(f"'{line}' -> '{simplified}'")
            simplified_lines.append(simplified)
        else:
            simplified_lines.append(line)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        for line in simplified_lines:
            f.write(line + '\n')

if __name__ == "__main__":
    input_file = "data/graph/roles.metadata.txt"
    output_file = "data/graph/roles.metadata.simplified.txt"
    process_file(input_file, output_file)
    print(f"Simplified roles saved to {output_file}") 